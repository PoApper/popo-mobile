# iOS

`package.json` 파일에 변동이 있으면, 꼭 ios에서도 CocoaPods의 의존성이 업뎃 되도록 합니다.

```bash
$ cd ios
$ pod install
```

## 실행

### dev 서버와 연결

```bash
$ npm run ios
```

### prod 서버와 연결

```bash
$ npm run ios:prod
```

## 앱 배포 버전 변경

`project.pbxproj` 파일에서 `MARKETING_VERSION` 값을 변경 해준다.

## 서명 셋업

서명은 App Store Connect API 키와 Apple 클라우드 관리 인증서로 자동 처리됩니다. 인증서·프로비저닝 프로파일은 빌드 시 자동 생성·갱신되므로 매년 갱신할 것이 없습니다.

빌드하는 Mac마다 한 번 설정합니다.

1. Apple Developer 계정 소유자에게 API 키(`.p8`, Key ID, Issuer ID)를 받습니다.
2. `.p8`을 저장소 밖 `~/.keys/AuthKey_<Key ID>.p8`에 둡니다. 원본은 비밀번호 관리자에 보관합니다.
3. `~/.zshrc`에 추가합니다.

   ```bash
   export ASC_KEY_ID=<Key ID>
   export ASC_ISSUER_ID=<Issuer ID>
   ```

> `.p8`·Key ID·Issuer ID는 절대 커밋하지 마세요. `.env`에도 넣지 마세요. `react-native-config`가 `.env` 값을 앱 번들에 포함합니다.

Xcode GUI(Organizer, 실기기 실행)는 계정에 팀원으로 로그인해야 하므로 사용할 수 없습니다. CLI로 빌드합니다.

## 앱 빌드 및 App Store 제출

프로젝트 루트에서 실행합니다. 내보내기 단계에서 App Store Connect 업로드까지 끝나며, 수 분 뒤 TestFlight에 빌드가 나타납니다.

```bash
AUTH=(-allowProvisioningUpdates
  -authenticationKeyPath ~/.keys/AuthKey_$ASC_KEY_ID.p8
  -authenticationKeyID $ASC_KEY_ID
  -authenticationKeyIssuerID $ASC_ISSUER_ID)

xcodebuild -workspace ios/popoMobile.xcworkspace \
  -scheme popoMobile \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath popoMobile.xcarchive \
  "${AUTH[@]}" archive

xcodebuild -exportArchive \
  -archivePath popoMobile.xcarchive \
  -exportPath . \
  -exportOptionsPlist ios/ExportOptions.plist \
  "${AUTH[@]}"

rm -rf popoMobile.xcarchive
```

[App Store Connect](https://appstoreconnect.apple.com)에서 빌드를 연결한 뒤 제출합니다.

업로드 단계가 실패하면 `ios/ExportOptions.plist`의 `destination`을 `export`로 바꿔 `popoMobile.ipa`를 만든 뒤, Transporter 앱으로 업로드합니다.

## 캐시 제거

```bash
# on ios/ dir
$ cd ios
$ rm -rf Pods
$ rm -f Podfile.lock
$ rm -rf build

# on any dir
$ rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

```bash
# CocoaPods의 캐시 삭제
$ pod install --repo-update
```

## Deep Linking

### 테스트 (개발 환경)

```bash
# Universal Links
npx uri-scheme open "https://popo-dev.poapper.club/room/{roomUuid}" --ios

# 커스텀 스킴
npx uri-scheme open "popo-dev://room/{roomUuid}" --ios
```

또는 기본 브라우저(Safari)에서 직접 URL을 입력하여 테스트할 수 있습니다.
