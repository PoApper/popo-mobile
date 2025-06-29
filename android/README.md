# Android

## Gradle

`android/` 경로에서 실행해야 합니다.

```bash
$ ./gradlew clean
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
