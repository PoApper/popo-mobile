# iOS Release Build & Upload

iOS 릴리즈 빌드를 생성하고 Transporter를 통해 App Store Connect에 업로드하는 워크플로우.

## Step 1: 버전 확인

`ios/popoMobile.xcodeproj/project.pbxproj`에서 현재 버전을 확인한다:

- `MARKETING_VERSION` (x.x.x 형식, 3곳)
- `CURRENT_PROJECT_VERSION` (빌드 번호, 3곳)

매 TestFlight/App Store 제출 전 범프가 필요하면 먼저 수행한다.

## Step 2: Archive 빌드

프로젝트 루트에서 실행:

```bash
xcodebuild -workspace ios/popoMobile.xcworkspace \
  -scheme popoMobile \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath popoMobile.xcarchive \
  archive
```

빌드 시간이 오래 걸리므로 `run_in_background`로 실행하고, 완료 후 결과를 확인한다.
`** ARCHIVE SUCCEEDED **`가 출력되면 성공.

## Step 3: IPA 내보내기

```bash
xcodebuild -exportArchive \
  -archivePath popoMobile.xcarchive \
  -exportPath . \
  -exportOptionsPlist ios/ExportOptions.plist
```

성공하면 프로젝트 루트에 `popoMobile.ipa`가 생성된다.

## Step 4: Transporter 열기

```bash
open -a Transporter popoMobile.ipa
```

Transporter가 열리면서 IPA가 첨부된다. 사용자가 수동으로 "전송" 버튼을 눌러 업로드한다.

## Step 5: 정리

업로드 완료 후 archive 및 IPA 파일을 정리한다:

```bash
rm -rf popoMobile.xcarchive popoMobile.ipa
```

## Notes

- Transporter CLI(`iTMSTransporter`)는 인증 문제로 사용 불가. GUI만 사용.
- `ExportOptions.plist`는 `ios/` 디렉토리에 포함되어 있음 (app-store 배포, manual signing).
- `MARKETING_VERSION`은 x.x.x 형식만 허용 (4자리 거부).
