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
