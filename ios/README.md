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

## 배포 인증서 갱신

Apple Distribution 인증서와 `Release` 프로비저닝 프로파일은 1년마다 만료됩니다. Apple Developer 계정이 개인 멤버십이라 재발급은 계정 소유자만 할 수 있습니다. 만료 한 달 전에 아래 절차로 갱신합니다.

1. **빌드하는 Mac에서** CSR을 만듭니다: 키체인 접근 → 인증서 지원 → 인증 기관에서 인증서 요청 → 디스크에 저장. 개인 키가 이 Mac에만 생기므로 `.p12`와 비밀번호를 주고받을 필요가 없습니다. 이전 갱신 때 만든 CSR이 남아 있고 그 개인 키가 키체인에 있으면 같은 파일을 다시 써도 됩니다.
2. 계정 소유자에게 **CSR 파일을 첨부해서** 다음을 요청합니다. 메신저가 `.certSigningRequest` 확장자를 거부하면 zip으로 묶어 보냅니다.
   - Certificates → `+` → **Apple Distribution** → **첨부한 CSR 업로드** → `.cer` 다운로드. 소유자 Mac의 CSR이나 Xcode 자동 생성으로 만든 인증서는 빌드 Mac에 개인 키가 없어 쓸 수 없습니다.
   - Profiles → 기존 **`Release`** 프로파일 **Edit**(새로 만들지 않습니다) → 새 인증서 선택 → 저장 → **Download**. `project.pbxproj`와 `ExportOptions.plist`가 이름으로 찾으므로 **이름은 `Release`로 유지**합니다.
3. 받은 `.cer`와 `.mobileprovision`을 더블클릭해 설치합니다. 개인 키 없이는 쓸 수 없는 파일이라 일반 메신저로 받아도 됩니다.
4. 설치 결과를 확인합니다.

   ```bash
   # Apple Distribution identity가 "valid"로 1개 보여야 합니다
   security find-identity -v -p codesigning
   # 설치된 프로파일의 내부 이름이 Release 인지 확인합니다
   security cms -D -i ~/Library/MobileDevice/Provisioning\ Profiles/<UUID>.mobileprovision | plutil -extract Name raw -o - -
   ```

프로파일 이름은 파일명이 아니라 **Download 시점에 Apple이 파일 안에 서명해 넣은 `Name` 값**입니다. 포털에서 이름이나 인증서를 바꾼 뒤에는 반드시 다시 Download한 파일을 받아야 하고, 파일명을 `Release.mobileprovision`으로 바꾸는 것은 효과가 없습니다. 만료된 옛 `Release` 프로파일이 `~/Library/Developer/Xcode/UserData/Provisioning Profiles/`에 남아 있으면 Xcode가 그것을 먼저 집어 `doesn't include signing certificate` 오류가 나므로 삭제합니다.

푸시 알림(APNs)은 만료가 없는 `.p8` 인증 키 하나를 Firebase의 개발·프로덕션 양쪽에 등록해 두었습니다. 배포 인증서 갱신과 무관하며 따로 갱신할 것이 없습니다.

## 앱 빌드

Xcode 에서 진행합니다.

POPO 드라이브 [iOS 빌드 및 배포](https://docs.google.com/document/d/1C1s7IaPpp15jBgNyjjILGEaj8Z3KVOKeSJ1uovLf53A/edit?tab=t.0#heading=h.ik2jb56m4d8c) 참고

### CLI로 빌드

프로젝트 루트에서 실행합니다. archive가 프로젝트 루트에 `popoMobile.xcarchive`로 생성됩니다.

실행 과정에서 키체인 비밀번호 입력이 두 번 정도 있을 수 있습니다.

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
