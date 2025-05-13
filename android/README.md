# Android

## Gradle

```bash
$  ./gradlew clean
```

### Build

```bash
# APK 빌드
$ ./gradlew assembleRelease

# AAB 빌드 (구글 플레이 제출용)
$ ./gradlew bundleRelease
$ cd android/app/build/outputs/bundle/release
```

## Logging

안드로이드 에뮬레이터에서 `console.log()`로 출력하는 로그를 보고 싶다면 아래 명령어로 `logkitty`를 실행해야 합니다.

```bash
$ npx react-native log-android
```
