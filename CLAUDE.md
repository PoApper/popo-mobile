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

| Alias | Path |
|-------|------|
| `@components/*` | `src/components/*` |
| `@screens/*` | `src/screens/*` |
| `@utils/*` | `src/utils/*` |
| `@navigation/*` | `src/navigation/*` |
| `@interfaces/*` | `src/interfaces/*` |
| `@styles/*` | `src/styles/*` |
| `@assets/*` | `src/assets/*` |

## Architecture

### Navigation (`src/navigation/`)
- `AppNavigator.tsx` — Root navigator; decides auth flow vs main app. Configures deep linking for `popo://` scheme and `https://popo.poapper.club`.
- `MainNavigator.tsx` — Bottom tab navigator with 4 tabs: Home, Paxi, MyReservation, MyInfo.
- `AuthNavigator.tsx` — Auth flow (Landing → Login → Signup).
- `types.ts` — All route param types (`RootStackParamList` and sub-lists). Must be updated when adding/modifying screens.
- `RootNavigation.ts` — Navigation ref for programmatic navigation outside React tree (used by notification handlers).

### API Layer (`src/utils/`)
- `api.ts` — Main Axios instance for POPO backend. Has request/response interceptors for auth tokens.
- `paxi_api.ts` — Separate Axios instance for the Paxi service backend.
- `refresh.utils.ts` — Token refresh logic with request queuing during refresh.
- `auth-tokens.ts` — Token retrieval from EncryptedStorage/cookies.
- `cookie.ts` — Cookie management via `@react-native-cookies/cookies`.

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

Copy `.env.example` → `.env`, `.env.dev.example` → `.env.dev`, `.env.prod.example` → `.env.prod`. Environment is selected automatically by build flavor/configuration. `react-native-config` exposes `Config.ENV` at runtime.

Firebase credentials are required: `google-services.json` (Android), `GoogleService-Info.plist` (iOS).

## Code Style

- Prettier: single quotes, no bracket spacing, trailing commas everywhere, avoid arrow parens
- ESLint: extends `@react-native`, warns on `react-hooks/exhaustive-deps`
- Functional components with hooks only
- Name magic numbers as constants
- Prefer composition over props drilling
- Separate distinct conditional rendering into separate components

## CI

GitHub Actions runs `pre-commit run --all-files` on PRs to `main` (format, lint, trailing whitespace, YAML validation, large file check).
