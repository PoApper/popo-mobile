<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# ios

## Purpose
iOS 네이티브 빌드 설정. CocoaPods 의존성 관리, New Architecture + Fabric, Hermes JS 엔진을 사용한다.

## Key Files

| File | Description |
|------|-------------|
| `Podfile` | CocoaPods 설정 (min iOS 13.0, Firebase static frameworks, Hermes, Flipper 비활성) |
| `GoogleService-Info.plist` | Firebase 인증 정보 |
| `popoMobile/Info.plist` | 앱 메타데이터 (번들 이름, ATS 설정, 폰트) |
| `popoMobile/AppDelegate.swift` | 앱 라이프사이클 및 푸시 알림 핸들링 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `Config/` | 빌드 설정 파일 |
| `popoMobile/` | 앱 소스 및 리소스 |
| `popoMobile.xcodeproj/` | Xcode 프로젝트 파일 |
| `popoMobile.xcworkspace/` | Xcode 워크스페이스 |

## For AI Agents

### Working In This Directory
- `pod install` 후 `.xcworkspace`로 열기
- New Architecture + Fabric 필수 (Reanimated 4 호환)
- Firebase static frameworks 사용
- 빌드 설정: Release, ReleaseDev

### Testing Requirements
- `npm run ios` — iOS 디버그 빌드
- `npm run ios:prod` — iOS 릴리즈 빌드

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
