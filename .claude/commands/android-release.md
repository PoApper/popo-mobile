# Android Release Build & Upload

Android 릴리즈 빌드(AAB)를 생성하고 Google Play Console에 업로드하는 워크플로우.

## Step 1: 버전 확인

`android/version.properties`에서 현재 버전을 확인한다:

- `ANDROID_VERSION_CODE` (정수, 매 릴리즈마다 1씩 증가)
- `ANDROID_VERSION_NAME` (x.x.x 형식)

릴리즈 전 범프가 필요하면 먼저 수행한다.

## Step 2: AAB 빌드

프로젝트 루트에서 실행:

```bash
npm run android:aab:prod
```

내부적으로 `./gradlew bundleProdRelease`를 실행하고, 빌드 결과물을 프로젝트 루트에 `app-prod-release.aab`로 복사한다.

빌드 시간이 오래 걸리므로 `run_in_background`로 실행하고, 완료 후 결과를 확인한다.
`BUILD SUCCESSFUL`이 출력되면 성공.

## Step 3: Google Play Console 열기

```bash
open https://play.google.com/console
```

사용자가 수동으로 AAB 파일(`app-prod-release.aab`)을 업로드한다.

## Step 4: 정리

업로드 완료 후 AAB 파일을 정리한다:

```bash
rm -f app-prod-release.aab
```

## Notes

- `android/version.properties`는 릴리즈 커밋에만 포함. 평소 작업 중 수정되어도 커밋하지 않는다.
- 디버깅용 prod 빌드가 필요하면 `./gradlew installProdDebug` 사용 (prod 환경 + console.log 가능).
- APK가 필요한 경우 `npm run android:apk:prod` 사용.
