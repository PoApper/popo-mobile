# POPO Release Build (Android + iOS)

Android AAB와 iOS IPA 릴리즈 빌드를 한 번에 생성하는 워크플로우.

## Step 1: 버전 확인 및 범프

아래 두 파일에서 현재 버전을 확인하고, 필요 시 사용자에게 범프 여부를 물어본다:

- `android/version.properties` — `ANDROID_VERSION_CODE`, `ANDROID_VERSION_NAME`
- `ios/popoMobile.xcodeproj/project.pbxproj` — `MARKETING_VERSION` (3곳), `CURRENT_PROJECT_VERSION` (3곳)

## Step 2: 병렬 빌드

Android AAB와 iOS Archive를 **동시에** `run_in_background`로 실행한다:

**Android:**

```bash
npm run android:aab:prod
```

**iOS:**

```bash
xcodebuild -workspace ios/popoMobile.xcworkspace \
  -scheme popoMobile \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath popoMobile.xcarchive \
  archive
```

## Step 3: iOS IPA 내보내기

iOS Archive 성공 후 IPA를 내보낸다:

```bash
xcodebuild -exportArchive \
  -archivePath popoMobile.xcarchive \
  -exportPath . \
  -exportOptionsPlist ios/ExportOptions.plist
```

## Step 4: 스토어 릴리즈 노트 초안

빌드가 백그라운드로 도는 동안 병행 작성한다. Play Console과 App Store Connect에
**그대로 복사·붙여넣기**할 수 있는 완성본을 코드 블록으로 출력한다.

### 4-1. 변경 사항 수집

git 태그는 누락되는 경우가 있으므로(v1.11.0은 태그 없음) 태그 대신
`android/version.properties`의 직전 범프 커밋을 기준으로 삼는다.

```bash
git log --oneline -3 -- android/version.properties   # 2번째 줄 = 직전 릴리즈
git log --oneline <직전-범프-커밋>..HEAD --no-merges
```

`git log`로 수집해야 **PR이 아닌 직접 커밋도 누락되지 않는다.** GitHub 자동 생성
노트는 PR만 수집하므로 이 용도로는 쓰지 않는다.

### 4-2. 사용자 체감 변경만 추리기

| 커밋 타입                                         | 처리                                                 |
| ------------------------------------------------- | ---------------------------------------------------- |
| `feat:`                                           | 개별 불렛                                            |
| `fix:`                                            | 사용자가 겪던 증상이면 개별 불렛, 내부 오류면 총괄로 |
| `refactor:` `ci:` `build(deps):` `chore:` `test:` | 총괄 불렛 하나로 뭉침                                |

### 4-3. 워딩 규칙

- **불렛 1개 = 1줄.** 문장 안에서 수동 줄바꿈하지 않는다. 두 스토어 모두 평문을
  기기 폭에 맞춰 자동 줄바꿈하므로 수동 줄바꿈은 좁은 화면에서 깨진다.
- **원인이 아니라 증상을 쓴다.**
  - ✗ `로그인 정보가 만료되면 메시지를 보낼 수 없던 문제`
  - ✓ `채팅을 오래 켜두면 메시지가 전송되지 않던 문제`
- **합쇼체(`~했습니다`).** POPO는 학교 공식 서비스이므로 해요체는 쓰지 않는다.
- **내부 용어 금지.** 소켓, 토큰, 인터셉터, 마이그레이션 등. 단 `Paxi`처럼 앱에서
  사용자에게 노출되는 기능명은 그대로 쓴다.
- **불렛 문자 `•`를 직접 입력한다.** 두 스토어 모두 마크다운 미지원이라
  `-`나 `*`는 문자 그대로 보인다.
- **항목 5개 미만이면 평평한 불렛만.** 5개 이상일 때만 `새로운 기능` `개선`
  `버그 수정` 헤더로 묶는다(대괄호 없이 이름만).
- **총괄 불렛(`앱 안정성 및 보안을 개선했습니다.`)을 단독으로 두지 않는다.**
  이것만 적힌 노트는 Apple이 권장하지 않고 사용자 리뷰에서도 불만이 나온다.

### 4-4. 제약

- Play Console 언어당 **500자**, App Store Connect 4000자. iOS/Android **동일 텍스트** 사용.
- 직전 버전의 스토어 출시 여부는 리포지토리에서 확인할 수 없다. 출시되지 않았다면
  그 버전의 변경 사항도 포함해야 하므로 사용자에게 확인한다.

### 4-5. 출력 예시

```
• Paxi 채팅을 오래 켜두면 메시지가 전송되지 않던 문제를 수정했습니다.
• 채팅 연결이 끊어졌을 때 안내 메시지를 표시합니다.
• 앱 안정성 및 보안을 개선했습니다.
```

## Step 5: 업로드

빌드 결과물을 각 스토어에 업로드한다:

Step 4에서 작성한 릴리즈 노트를 두 스토어의 "새로운 기능" 항목에 붙여넣는다.

- **Android**: `open https://play.google.com/console` → `app-prod-release.aab` 수동 업로드
- **iOS**: `open -a Transporter popoMobile.ipa` → "전송" 버튼으로 업로드

## Step 6: 정리

업로드 완료 후 빌드 산출물을 정리한다:

```bash
rm -rf app-prod-release.aab popoMobile.xcarchive popoMobile.ipa
```
