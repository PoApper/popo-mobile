# POPO Mobile

## 가이드

[모바일 온보딩 가이드](https://docs.google.com/document/d/1C1s7IaPpp15jBgNyjjILGEaj8Z3KVOKeSJ1uovLf53A/edit?tab=t.0)를 읽어주세요

## 사전 요구사항

| 도구           | 버전                          | 비고                        |
| -------------- | ----------------------------- | --------------------------- |
| Node.js        | >= 18                         | `package.json` engines 참고 |
| Ruby           | >= 2.6.10                     | `Gemfile` 참고              |
| CocoaPods      | >= 1.13 (1.15.0, 1.15.1 제외) | `Gemfile` 참고              |
| Xcode          | 16 이상                       | React Native 0.78 기준      |
| Android Studio | 최신 권장                     | SDK 36 이상                 |
| JDK            | 17                            | Android Gradle 빌드에 필요  |

Firebase 설정 파일도 필요합니다. 둘 다 Firebase 콘솔에서 다운로드할 수 있고, 보안상 Git에 포함되지 않습니다.

- Android: `android/app/google-services.json`
- iOS: `ios/GoogleService-Info.plist`

## 환경설정

`.env.example`을 복사해서 `.env`를 만들고 값을 채워넣습니다.

```bash
cp .env.example .env
```

## 실행

```bash
npm run android   # Android (dev 서버 연결)
npm run ios       # iOS (dev 서버 연결)
```

iOS는 처음 받았거나 `package.json`이 바뀐 뒤에는 `cd ios && pod install`을 먼저 실행해야 합니다.

프로덕션 서버에 붙이려면 `npm run android:prod`를 씁니다. iOS는 현재 불가능합니다.
다만, 에뮬레이션 환경은 실 기기와 동작 방식이 다르므로 에뮬레이션 환경에서는 간단하게 개발 환경에 붙여서 확인하고, 실 서버 타겟으로 빌드한 뒤 각 스토어 테스트 환경에 배포 후 실 기기에서 테스트하기를 권장합니다.
배포 방법은 [모바일 온보딩 가이드](https://docs.google.com/document/d/1C1s7IaPpp15jBgNyjjILGEaj8Z3KVOKeSJ1uovLf53A/edit?tab=t.0) 참고

플랫폼별 상세는 각 문서를 참고하세요.

- **[Android 가이드](./android/README.md)**
- **[iOS 가이드](./ios/README.md)**

## 앱 버전 변경

### Android

`android/version.properties` 파일을 수정합니다.

```properties
ANDROID_VERSION_CODE=77       # 매 배포마다 1씩 올림, 리셋하지 않음 (Play Store 업로드 기준)
ANDROID_VERSION_NAME=1.12.0   # 사용자에게 보이는 버전
```

버전 번호는 커밋 내용에 따라 정합니다. `feat:` 커밋이 포함되면 **minor**,
`fix:`나 의존성 범프만 있으면 **patch**를 올립니다.

### iOS

`ios/popoMobile.xcodeproj/project.pbxproj`에서 두 값을 수정합니다.

- `MARKETING_VERSION` — 사용자에게 보이는 버전 (예: 1.10.1)
- `CURRENT_PROJECT_VERSION` — 빌드 번호. 새 `MARKETING_VERSION`마다 **1로 리셋**하고,
  같은 버전을 다시 제출할 때만 1씩 올림

Xcode에서도 바꿀 수 있습니다: 프로젝트 선택 > General > Identity 섹션의 Version, Build 필드.

`project.pbxproj`를 직접 편집할 경우, `MARKETING_VERSION`이 여러 곳(Debug/Release 각 타겟)에 있으니 전부 같은 값으로 맞춰야 합니다.

## 배포

Claude Code에서 두 커맨드를 순서대로 실행합니다.

1. **`/popo-release`** — 버전 범프 → Android AAB·iOS Archive 병렬 빌드 → IPA 내보내기 → 스토어 릴리즈 노트 초안 작성 → 업로드
2. **`/release-pr`** — 버전 범프 커밋 → PR 생성(변경 목록·배포 전 확인 시나리오 포함) → squash merge → 릴리즈 노트를 본문으로 담은 GitHub Release(`vX.Y.Z` 태그 포함) 생성

버전 범프는 빌드·업로드가 성공한 뒤에 커밋합니다. 빌드가 실패하면 버전 범프 PR이 남지 않도록 `/release-pr`을 실행하지 않습니다.

플랫폼별 빌드만 필요하면 `/android-release`, `/ios-release`를 씁니다.

빌드를 수동으로 할 경우:

```bash
# 1. 빌드 (서로 독립적이므로 동시에 실행)
npm run android:aab:prod
# → android/app/build/outputs/bundle/prodRelease/app-prod-release.aab
xcodebuild -workspace ios/popoMobile.xcworkspace -scheme popoMobile \
  -configuration Release -destination 'generic/platform=iOS' \
  -archivePath popoMobile.xcarchive archive

# 2. iOS IPA 내보내기
xcodebuild -exportArchive -archivePath popoMobile.xcarchive \
  -exportPath . -exportOptionsPlist ios/ExportOptions.plist

# 3. 업로드 후 정리
rm -rf app-prod-release.aab popoMobile.xcarchive popoMobile.ipa
```

업로드는 [Play Console](https://play.google.com/console)에 AAB를 올리고,
iOS는 `open -a Transporter popoMobile.ipa` 후 "전송"을 누릅니다.
