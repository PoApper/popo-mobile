# Android

## Emulator

Google Play에 접속 가능한 Emulator를 사용해야 합니다. Google Play 접속이 가능해야 Emulator에서 Firebase Token 값을 받을 수 있습니다.

**권장**: `Pixel 9 Pro` 계열 Emulator
**비권장**: `Medium Phone API 36.0` (Google Play 미지원)

## 실행

### Dev 환경 (개발 서버)

```bash
npm run android
```

### Prod 환경 (프로덕션 서버)

```bash
npm run android:prod
```

## 빌드 (배포용)

### 사전 준비

`android/app` 경로에 아래 파일이 있는지 확인:

- `popo-release-key.keystore` (GooglePlay 서명)
- `google-services.json` (Firebase 설정)

### 빌드 명령어

```bash
# APK 빌드
cd android
./gradlew assembleRelease

# AAB 빌드 (Google Play 제출용)
# dev 환경으로 빌드(내부 테스트 시 사용)
npm run android:aab:dev
cd android/app/build/outputs/bundle/devRelease
open .

# prod 환경으로 빌드(실제 사용자 배포)
npm run android:aab:prod
cd android/app/build/outputs/bundle/prodRelease
open .
```

## Google Play Store 제출

1. [Google Play Console](https://play.google.com/console) 접속 후 POPO 앱 선택
2. 왼쪽 메뉴에서 **프로덕션** (또는 내부 테스트 등 원하는 트랙) 선택
3. **새 버전 만들기** 클릭
4. 위에서 빌드한 `.aab` 파일 업로드 (`npm run android:aab:prod` 실행 시 프로젝트 루트에 `app-prod-release.aab`로 복사됨)
5. 출시 노트 작성 후 **검토 시작**

## Logging

에뮬레이터의 `console.log()` 출력을 보려면:

```bash
npx react-native log-android
```

## Troubleshooting

### 빌드 문제 해결 순서

대부분의 빌드 문제는 아래 순서대로 시도하면 해결됩니다:

#### 1. 설정 파일 변경 후 (`build.gradle`, `AndroidManifest.xml`)

```bash
cd android
./gradlew clean
```

#### 2. JS 번들 캐시 문제

```bash
npx react-native start --reset-cache
```

#### 3. React Native 네이티브 캐시 문제

```bash
npx react-native clean
# → a 입력 (모든 옵션 선택)
npm install
```

#### 4. Gradle 캐시 문제

```bash
cd android
./gradlew clean --refresh-dependencies
```

#### 5. node_modules 꼬임

```bash
rm -rf node_modules && npm install
```

#### 6. 에뮬레이터 저장 공간 부족

`INSTALL_FAILED_INSUFFICIENT_STORAGE: Failed to override installation location` 혹은 `java.io.IOException: Requested internal only, but not enough space`
라는 에러는 컴퓨터가 아닌 에뮬레이터의 저장 공간이 부족한 것입니다. 에뮬레이터 안에 안드로이드 앱을 삭제하고 재설치하면 해결됩니다.

```bash
adb uninstall com.popomobile.dev
npm run android
```

#### 6. 위에 것들 안먹히면 시도

```bash
# 로컬 빌드 아티팩트 완전 삭제
cd android
rm -rf .gradle build app/.cxx app/build

# Gradle 캐시의 React Native 의존성 정리
cd ..
rm -rf ~/.gradle/caches/transforms-* ~/.gradle/caches/modules-2/files-2.1/com.facebook.react

# 재빌드
cd android
./gradlew clean --refresh-dependencies
./gradlew assembleDebug --no-daemon
```

## Deep Linking

### 테스트 (개발 환경)

```bash
# Universal Links
npx uri-scheme open "https://popo-dev.poapper.club/room/{roomUuid}" --android

# 커스텀 스킴
npx uri-scheme open "popo-dev://room/{roomUuid}" --android
```

(25.12.23) 기본 브라우저인 Chrome에서 링크를 입력해봤지만 iOS와는 다르게 안드로이드 애뮬레이터에서는 앱이 열리지 않고 플레이스토어로 이동되는 문제가 있음. 위에 작성한 `uri-scheme`을 이용하면 정상 작동함.
