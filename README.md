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
| Android Studio | 최신 권장                     | SDK 34 이상                 |
| JDK            | 17                            | Android Gradle 빌드에 필요  |

Firebase 설정 파일도 필요합니다. 둘 다 Firebase 콘솔에서 다운로드할 수 있고, 보안상 Git에 포함되지 않습니다.

- Android: `android/app/google-services.json`
- iOS: `ios/GoogleService-Info.plist`

## 환경설정

`.env.example`을 복사해서 `.env`를 만들고 값을 채워넣습니다.

```bash
cp .env.example .env
```

플랫폼별 세부 설정은 `/android`, `/ios`의 `README.md` 참고

## 앱 버전 변경

### Android

`android/version.properties` 파일을 수정합니다.

```properties
ANDROID_VERSION_CODE=71       # 매 배포마다 1씩 올림 (Play Store 업로드 기준)
ANDROID_VERSION_NAME=1.10.1   # 사용자에게 보이는 버전 (예: 1.10.1)
```

### iOS

`ios/popoMobile.xcodeproj/project.pbxproj`에서 두 값을 수정합니다.

- `MARKETING_VERSION` — 사용자에게 보이는 버전 (예: 1.10.1)
- `CURRENT_PROJECT_VERSION` — 빌드 번호, 같은 버전을 다시 올릴 때 1씩 올림

Xcode에서도 바꿀 수 있습니다: 프로젝트 선택 > General > Identity 섹션의 Version, Build 필드.

`project.pbxproj`를 직접 편집할 경우, `MARKETING_VERSION`이 여러 곳(Debug/Release 각 타겟)에 있으니 전부 같은 값으로 맞춰야 합니다.
