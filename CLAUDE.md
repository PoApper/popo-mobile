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
- `socket-reauth.ts` / `socket-adopt.ts` — 토큰 갱신 후 재연결, 새 소켓 채택/폐기 오케스트레이션 (의존성 주입으로 단위 테스트).
- Chat screens manage socket connections via `useRef` and clean up on unmount.

**핸드셰이크 계약:** 전송 계층 `connect`는 인증 확정이 아니다. 서버가 `handleConnection`에서 토큰을 검증한 뒤 보내는 `connected` 이벤트를 받아야 사용 가능 상태다 (`NewChatScreen`의 입력창 활성화 조건). 토큰이 만료됐으면 서버는 `accessTokenExpired`를 보내고 `client.disconnect()`하므로 socket.io 자동 재연결이 동작하지 않는다 — 토큰을 갱신해 소켓을 재생성하는 것이 유일한 복구 경로다.

**서버 버전 의존:** 위 두 이벤트는 `paxi-popo-nest-api` v1.2.1(PR #154)부터 emit된다. 서버를 그 이전으로 롤백하면 채팅 입력이 영구 비활성화된다.

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

### 버전 범프 관례

- `feat:` 커밋이 포함되면 **minor**, `fix:`/의존성 범프만이면 **patch**. (예: v1.11.0은 `feat: 학생단체 소개 탭 추가`, v1.10.4는 `fix:` 2건)
- `CURRENT_PROJECT_VERSION`(iOS 빌드 번호)은 새 `MARKETING_VERSION`마다 **1로 리셋**하고, 같은 버전을 재제출할 때만 증가시킨다.
- `ANDROID_VERSION_CODE`는 리셋하지 않고 매 릴리즈 단조 증가.

### 스토어 릴리즈 노트

`git log <직전-version.properties-범프-커밋>..HEAD --no-merges`로 수집한다. git 태그는 누락된 적이 있어(v1.11.0 무태그) 태그를 기준으로 쓰지 않는다. GitHub 자동 생성 노트는 PR만 수집하므로 직접 커밋이 빠진다.

`feat:`와 사용자 체감 `fix:`만 개별 항목으로, `refactor:`/`ci:`/`build(deps):`는 "앱 안정성 및 보안을 개선했습니다" 한 줄로 뭉친다. 항목당 한 줄(수동 줄바꿈 금지 — 두 스토어가 기기 폭에 맞춰 자동 줄바꿈한다), 원인이 아닌 증상, 합쇼체, 내부 용어 금지(`Paxi` 같은 노출 기능명은 허용), `•` 직접 입력(마크다운 미지원), 5개 미만이면 헤더 없이 나열. 총괄 불렛 단독 금지. Play Console 언어당 500자, iOS/Android 동일 텍스트.

상세 규칙은 `README.md`의 "릴리즈 노트 작성" 및 `.claude/commands/popo-release.md` Step 4에 있다.

### Android

- `npm run android:aab:prod` → `android/app/build/outputs/bundle/prodRelease/app-prod-release.aab`.
- `android/version.properties`는 릴리즈 커밋에만 포함. 평소 작업 중 수정되어도 커밋하지 않는다.
- 디버깅용 prod 빌드: `./gradlew installProdDebug` (prod 환경 + console.log 가능).

**target API 제약:** Google Play는 2026-08-31부터 API 36 이상을 요구한다. `compileSdk`/`targetSdk`는 36, `buildToolsVersion`은 36.1.0이다. RN 0.78이 물고 오는 AGP는 **8.8.0**이라 `compileSdk 36`을 공식 지원하지 않으므로 `android/gradle.properties`의 `android.suppressUnsupportedCompileSdk=36`으로 경고를 억제한다. RN 업그레이드 시 AGP 8.9+로 옮기고 이 플래그를 제거한다.

### iOS

- 릴리즈 빌드: `xcodebuild archive` → `xcodebuild -exportArchive` → Transporter GUI로 업로드 (Transporter CLI는 인증 문제로 사용 불가).
- `MARKETING_VERSION` (x.x.x 형식만 허용, 4자리 거부) 및 `CURRENT_PROJECT_VERSION`은 `ios/popoMobile.xcodeproj/project.pbxproj`에 3곳 존재. 매 TestFlight/App Store 제출 전 범프 필요.

## Claude Code 커맨드

`.claude/commands/`의 릴리즈 워크플로우 커맨드는 팀 공유용으로 추적된다(`popo-release`, `android-release`, `ios-release`). `.gitignore`가 `.claude/*`를 무시하고 `!.claude/commands/`로 예외 처리하므로, 이 디렉토리 외의 `.claude/` 하위 파일은 커밋되지 않는다.

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

GitHub Actions runs `pre-commit run --all-files` on PRs to `main` (format, lint, **TypeScript typecheck**, trailing whitespace, YAML validation, large file check).

타입체크 훅은 `always_run: true`라 스테이징된 파일이 없어도 항상 실행된다. 오래된 PR은 이 훅이 추가되기 전에 CI가 통과했을 수 있으므로, 머지 전 `npx tsc --noEmit`을 다시 돌려 확인한다.
