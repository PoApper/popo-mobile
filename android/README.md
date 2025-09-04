# Android

## Emulator

Google Play에 접속 가능한 Emulator를 사용해야 합니다. Google Play 접속이 가능해야 Emulator에서 Firebase Token 값을 받을 수 있습니다.

`Pixel 9 Pro` 계열의 Emulator 사용을 권장 합니다. `Medium Phone API 36.0`과 같은 Emulator는 Google Play에 접속이 안 되는 경우가 있습니다.

## Gradle

`android/` 경로에서 실행해야 합니다.

빌드 캐시를 초기화 하거나, `build.gradle`, `AndroidManifest.xml` 파일이 수정된 후에는 아래의 `clean` 명령어를 수행합니다.

```bash
$ ./gradlew clean
```

빌드가 꼬인다면 아래 명령어를 실행해보자.
```bash
$ ./gradlew assembleDebug --no-daemon
```

### Build

`android/app` 경로에 아래 두 파일이 있는지 확인합니다.

- `popo-release-key.keystore` (GooglePlay)
- `google-services.json` (Firebase)

그리고 `POPO_KEYSTORE_PASSWORD`가 잘 설정 되어 있는지 확인합니다.

```bash
# APK 빌드
$ ./gradlew assembleRelease

# AAB 빌드 (구글 플레이 제출용)
$ ./gradlew bundleRelease
$ cd /app/build/outputs/bundle/release
$ open .
```

## Logging

안드로이드 에뮬레이터에서 `console.log()`로 출력하는 로그를 보고 싶다면 아래 명령어로 `logkitty`를 실행해야 합니다.

```bash
$ npx react-native log-android
```
