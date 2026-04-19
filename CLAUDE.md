# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

POPO Mobile is a React Native (v0.78) campus service app for POSTECH students. It provides place/equipment reservations, club/association info, campus shuttle schedules, a ride-sharing feature (Paxi) with real-time chat, and push notifications. Written in TypeScript with React 19.

## Common Commands

```bash
# Development
npm run start                # Start Metro bundler
npm run android              # Run Android dev build (alias for android:dev)
npm run ios                  # Run iOS debug build

# Build
npm run android:apk:prod     # Build production APK
npm run android:aab:prod     # Build production AAB for Play Store
npm run ios:prod             # Run iOS release build

# Code Quality
npm run format               # Prettier
npm run lint                 # ESLint with auto-fix
npm run pc                   # Run all pre-commit hooks (format + lint + checks)
npm run test                 # Jest tests
```

Android uses Gradle product flavors (`dev`/`prod`) combined with build types (`Debug`/`Release`), e.g. `npm run android:dev` runs `devDebug`, `npm run android:prod:release` runs `prodRelease`.

## Path Aliases

Configured in both `tsconfig.json` and `babel.config.js` (via `babel-plugin-module-resolver`):

| Alias           | Path               |
| --------------- | ------------------ |
| `@components/*` | `src/components/*` |
| `@screens/*`    | `src/screens/*`    |
| `@utils/*`      | `src/utils/*`      |
| `@navigation/*` | `src/navigation/*` |
| `@interfaces/*` | `src/interfaces/*` |
| `@styles/*`     | `src/styles/*`     |
| `@assets/*`     | `src/assets/*`     |

## Architecture

### Navigation (`src/navigation/`)

- `AppNavigator.tsx` — Root navigator; decides auth flow vs main app. Configures deep linking for `popo://` scheme and `https://popo.poapper.club`.
- `MainNavigator.tsx` — Bottom tab navigator with 4 tabs: Home, Paxi, MyReservation, MyInfo.
- `AuthNavigator.tsx` — Auth flow (Landing → Login → Signup).
- `types.ts` — All route param types (`RootStackParamList` and sub-lists). Must be updated when adding/modifying screens.
- `RootNavigation.ts` — Navigation ref for programmatic navigation outside React tree (used by notification handlers).

### API Layer (`src/utils/`)

- `api.ts` — Main Axios instance for POPO backend. Has request/response interceptors for auth tokens.
- `paxi_api.ts` — Separate Axios instance for the Paxi service backend. FCM 키 등록은 이 인스턴스로 요청.
- `refresh.utils.ts` — Token refresh logic with request queuing during refresh. **반드시 plain `axios`(interceptor 없는)로 갱신 요청해야 데드락 방지.**
- `auth-tokens.ts` — Token retrieval from EncryptedStorage/cookies.
- `cookie.ts` — Cookie management via `@react-native-cookies/cookies`.

**Auth contract:** 두 백엔드 모두 cookie-only auth (`request.cookies.Authentication`). `Authorization: Bearer` 헤더는 지원하지 않는다. Android OkHttp는 WebKit CookieManager와 쿠키를 공유하지 않으므로, 크로스 호스트 쿠키는 request interceptor에서 `config.headers.Cookie`로 명시 설정해야 한다.

**주의:** `api.ts`와 `paxi_api.ts`는 독립된 interceptor를 가진다. interceptor 수정 시 양쪽 모두 적용해야 한다.

### Real-Time Chat (Paxi)

- `socket-factory.ts` — Creates authenticated Socket.io connections with auto-reconnection.
- `constants/socket-events.ts` — WebSocket event name constants.
- Chat screens manage socket connections via `useRef` and clean up on unmount.

### State Management

Local `useState`/`useRef` per screen. No global state library (no Redux/Zustand). Persistent data stored in `react-native-encrypted-storage`.

### Push Notifications

- `firebase.ts` — FCM token registration and message handling.
- `notifee.ts` — Local notification display via `@notifee/react-native`.
- Notifications integrate with deep linking to route to specific screens.

### Styling (`src/styles/default.ts`)

- `colors.dark` / `colors.light` objects for theme colors.
- `backgroundColor()`, `textColor()`, `borderColor()` helper functions that take `isDarkMode` boolean.
- `common` StyleSheet for shared layout patterns (safeArea, container, header).
- Dark mode detected via `useColorScheme()` hook in screens.

## Environment Setup

Copy `.env.example` → `.env`. `react-native-config`이 이 단일 파일을 로드하며, ENV 값은 빌드 flavor에 의해 결정된다.

Firebase credentials are required: `google-services.json` (Android), `GoogleService-Info.plist` (iOS).

## Release & Versioning

### Android

- `npm run android:aab:prod` → `android/app/build/outputs/bundle/prodRelease/app-prod-release.aab`.
- `android/version.properties`는 릴리즈 커밋에만 포함. 평소 작업 중 수정되어도 커밋하지 않는다.
- 디버깅용 prod 빌드: `./gradlew installProdDebug` (prod 환경 + console.log 가능).

### iOS

- 릴리즈 빌드: `xcodebuild archive` → `xcodebuild -exportArchive` → Transporter GUI로 업로드 (Transporter CLI는 인증 문제로 사용 불가).
- `MARKETING_VERSION` (x.x.x 형식만 허용, 4자리 거부) 및 `CURRENT_PROJECT_VERSION`은 `ios/popoMobile.xcodeproj/project.pbxproj`에 3곳 존재. 매 TestFlight/App Store 제출 전 범프 필요.

## Git Workflow

- PR은 squash merge만 사용 (merge commit 비허용).
- `android/version.properties`는 릴리즈 시에만 커밋.

## Code Style

- Prettier: single quotes, no bracket spacing, trailing commas everywhere, avoid arrow parens
- ESLint: extends `@react-native`, warns on `react-hooks/exhaustive-deps`
- Functional components with hooks only
- Name magic numbers as constants
- Prefer composition over props drilling
- Separate distinct conditional rendering into separate components

## CI

GitHub Actions runs `pre-commit run --all-files` on PRs to `main` (format, lint, trailing whitespace, YAML validation, large file check).
