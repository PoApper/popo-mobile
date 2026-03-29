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

## 앱 빌드

Xcode 에서 진행합니다.

POPO 드라이브 [iOS 빌드 및 배포](https://docs.google.com/document/d/1C1s7IaPpp15jBgNyjjILGEaj8Z3KVOKeSJ1uovLf53A/edit?tab=t.0#heading=h.ik2jb56m4d8c) 참고

### CLI로 빌드

프로젝트 루트에서 실행합니다. archive가 프로젝트 루트에 `popoMobile.xcarchive`로 생성됩니다.

실행 과정에서 키체인 비밀번호 입력이 두 번정도 있을 수 있습니다.

```bash
xcodebuild -workspace ios/popoMobile.xcworkspace \
  -scheme popoMobile \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath popoMobile.xcarchive \
  archive
```

## App Store 제출

### 방법 1: Xcode Organizer

1. Xcode 메뉴 → **Window** → **Organizer** 열기
2. 왼쪽에서 **popoMobile** 선택 → 빌드한 archive 확인
3. **Distribute App** 클릭
4. **App Store Connect** → **Upload** 선택
5. 서명/프로비저닝 확인 후 업로드
6. [App Store Connect](https://appstoreconnect.apple.com)에서 빌드 연결 후 제출

> CLI로 archive를 생성한 경우 Organizer에 표시되지 않을 수 있습니다. 아래 명령어로 이동 후 Organizer를 다시 열어주세요.
>
> ```bash
> mkdir -p ~/Library/Developer/Xcode/Archives/$(date +%Y-%m-%d)
> mv popoMobile.xcarchive ~/Library/Developer/Xcode/Archives/$(date +%Y-%m-%d)/popoMobile.xcarchive
> ```

### 방법 2: Transporter (Organizer에서 프로비저닝 에러가 발생할 경우)

archive를 IPA로 내보낸 뒤 Transporter 앱으로 직접 업로드합니다.

```bash
# IPA 내보내기 (ExportOptions.plist는 ios/ 디렉토리에 포함되어 있음)
# 프로젝트 루트에서 실행
xcodebuild -exportArchive \
  -archivePath popoMobile.xcarchive \
  -exportPath . \
  -exportOptionsPlist ios/ExportOptions.plist
```

1. **Transporter** 앱을 열고 프로젝트 루트의 `popoMobile.ipa` 파일을 드래그 앤 드롭
2. **전송** 클릭하여 업로드
3. [App Store Connect](https://appstoreconnect.apple.com)에서 빌드 연결 후 제출

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
