<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# android

## Purpose
Android 네이티브 빌드 설정. Gradle product flavor (dev/prod)와 build type (Debug/Release) 조합으로 빌드 변형을 관리한다.

## Key Files

| File | Description |
|------|-------------|
| `build.gradle` | 루트 빌드 설정 (SDK 버전, Kotlin 2.0.21, NDK, Firebase 플러그인) |
| `settings.gradle` | 프로젝트 include 설정 |
| `gradle.properties` | Gradle 속성 (New Architecture, Hermes 활성화) |
| `version.properties` | 앱 버전 정보 (릴리즈 시에만 커밋) |
| `app/build.gradle` | 앱 레벨 설정 (react-native-config, JSC, ProGuard 비활성) |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `app/` | 앱 모듈 (소스, 매니페스트, 리소스) |
| `app/src/main/` | 공통 소스 (AndroidManifest, Java, 리소스) |
| `app/src/dev/` | dev flavor 매니페스트 오버라이드 |
| `app/src/prod/` | prod flavor 매니페스트 오버라이드 |
| `gradle/` | Gradle wrapper |

## For AI Agents

### Working In This Directory
- `version.properties`는 릴리즈 시에만 커밋
- compileSdk 35, minSdk 24, targetSdk 35
- New Architecture + Hermes 엔진 활성화
- 환경 변수: react-native-config가 `.env` 파일에서 로드

### Testing Requirements
- `npm run android` — dev 디버그 빌드 실행
- `npm run android:apk:prod` — 프로덕션 APK 빌드

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
