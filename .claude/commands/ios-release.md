# iOS Release Build & Upload

iOS 릴리즈 빌드를 생성하고 App Store Connect에 업로드하는 워크플로우. 서명은 App Store Connect API 키 + 클라우드 관리 인증서로 자동 처리된다.

## Step 0: API 키 확인

```bash
echo "$ASC_KEY_ID $ASC_ISSUER_ID"; ls ~/.keys/AuthKey_$ASC_KEY_ID.p8
```

환경변수가 비어 있거나 `.p8` 파일이 없으면 빌드를 중단하고 사용자에게 `ios/README.md`의 "서명 셋업"을 안내한다.

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
  -allowProvisioningUpdates \
  -authenticationKeyPath ~/.keys/AuthKey_$ASC_KEY_ID.p8 \
  -authenticationKeyID $ASC_KEY_ID \
  -authenticationKeyIssuerID $ASC_ISSUER_ID \
  archive
```

빌드 시간이 오래 걸리므로 `run_in_background`로 실행하고, 완료 후 결과를 확인한다.
`** ARCHIVE SUCCEEDED **`가 출력되면 성공.

## Step 3: 내보내기 및 업로드

```bash
xcodebuild -exportArchive \
  -archivePath popoMobile.xcarchive \
  -exportPath . \
  -exportOptionsPlist ios/ExportOptions.plist \
  -allowProvisioningUpdates \
  -authenticationKeyPath ~/.keys/AuthKey_$ASC_KEY_ID.p8 \
  -authenticationKeyID $ASC_KEY_ID \
  -authenticationKeyIssuerID $ASC_ISSUER_ID
```

`ExportOptions.plist`의 `destination: upload`로 인해 export와 동시에 App Store Connect에 업로드된다. `** EXPORT SUCCEEDED **`가 출력되면 성공이며, 수 분 뒤 TestFlight에 빌드가 나타난다.

## Step 4: 정리

```bash
rm -rf popoMobile.xcarchive
```

## Notes

- 서명 인증서·프로파일은 빌드 시 자동 생성·갱신된다. 수동 갱신할 것이 없다.
- 서명/인증 단계에서 실패하면 API 키가 폐기되었을 수 있다. Apple Developer 계정 소유자에게 확인을 요청하도록 안내한다.
- 업로드가 실패하면 `ExportOptions.plist`의 `destination`을 `export`로 바꿔 IPA를 만든 뒤 `open -a Transporter popoMobile.ipa`로 업로드한다.
- `MARKETING_VERSION`은 x.x.x 형식만 허용 (4자리 거부).
