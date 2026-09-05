# Release PR (버전 범프 커밋 → PR → GitHub Release)

`/popo-release`로 빌드·스토어 업로드까지 끝낸 뒤, 로컬에 남아있는 버전 범프를
커밋해 main에 PR로 올리고, 머지된 커밋에 GitHub Release(태그 포함)를 만드는 워크플로우.

**전제:** `/popo-release`가 이미 실행되어 버전 파일이 수정된 상태(uncommitted)이고,
빌드와 스토어 업로드가 성공했다. 빌드가 실패했다면 이 커맨드를 실행하지 않는다.

## Step 1: 사전 확인

```bash
git status
git diff -- android/version.properties ios/popoMobile.xcodeproj/project.pbxproj
```

- 두 버전 파일에 uncommitted 변경이 **없으면** 중단하고 "먼저 `/popo-release`를
  실행해 버전을 범프하고 빌드/업로드를 완료하세요"라고 안내한다.
- 버전 파일 외의 변경이 섞여 있으면 사용자에게 알리고, 이 커밋에 포함할지 확인한다.
  (릴리즈 커밋은 버전 파일만 담는 것이 원칙)

## Step 2: 새 버전 확인

diff에서 새 버전 문자열을 읽는다. 사용자에게 다시 묻지 않는다.

- `android/version.properties` — `ANDROID_VERSION_NAME`
- `project.pbxproj` — `MARKETING_VERSION` (3곳 모두 동일한지 확인)

두 값이 다르면 중단하고 사용자에게 알린다. 이후 단계의 `vX.Y.Z`는 이 값이다.

## Step 3: 릴리즈 브랜치 생성

```bash
git switch -c release/vX.Y.Z
```

## Step 4: 커밋

버전 파일만 스테이징한 뒤 커밋한다. 제목 한 줄, **본문 없음.**

```bash
git add android/version.properties ios/popoMobile.xcodeproj/project.pbxproj
git commit -m "release: vX.Y.Z"
```

## Step 5: 푸시

```bash
git push -u origin release/vX.Y.Z
```

## Step 6: PR 본문 작성 및 생성

### 6-1. 변경 사항 수집

git 태그는 누락된 이력이 있으므로(v1.11.0, v1.12.0 무태그) 태그가 아니라
`android/version.properties`의 직전 범프 커밋을 기준으로 삼는다.

```bash
git log --oneline -3 -- android/version.properties   # 2번째 줄 = 직전 릴리즈
git log --oneline <직전-범프-커밋>..HEAD --no-merges
```

### 6-2. PR 본문 형식

**`.github/PULL_REQUEST_TEMPLATE.md`를 쓰지 않는다.** 그 템플릿은 기능 PR용이라
릴리즈 PR에는 맞지 않는다. 릴리즈 PR의 diff는 버전 파일 5줄뿐이라 리뷰할 코드가
없고, 이 PR이 하는 일은 **기록**(이 버전에 뭐가 들어갔나) · **QA 게이트**(배포 전
뭘 확인하나) · **출시 판단**(머지 = 나간다) 셋뿐이다. 아래 형식을 그대로 쓴다.

스토어 릴리즈 노트와 달리 **리뷰어(개발자) 대상**이므로 소켓·토큰·인터셉터 같은
내부 용어를 그대로 써도 된다.

```markdown
## 📦 vX.Y.Z

|         | 이전            | 이번            |
| ------- | --------------- | --------------- |
| Android | A.B.C (code N)  | X.Y.Z (code M)  |
| iOS     | A.B.C (build P) | X.Y.Z (build Q) |

## 포함된 변경

### 새로운 기능

- (`feat:` 커밋을 동작 관점으로 서술, PR 번호 표기)

### 버그 수정

- (`fix:` 커밋을 "어떤 증상이 어떻게 고쳐졌는지"로 서술, PR 번호 표기)

### 기타

- (`refactor:` `ci:` `build(deps):` `chore:` `test:` `docs:`는 한 줄로 뭉침)

## 배포 전 확인 시나리오

- [ ] Android (환경: API 36 / Android 14)
- [ ] iOS (환경: iOS 18.5)
- [ ] (6-3 규칙으로 만든 시나리오 항목)

## 주의사항

- 롤백 대상: vA.B.C (versionCode N)
- (회귀 위험이 있는 변경, 서버 의존, 마이그레이션 필요 여부 등)
```

버전 표의 "이전" 값은 직전 범프 커밋에서 읽는다.

```bash
git show <직전-범프-커밋>:android/version.properties
```

### 6-3. 테스트 체크리스트 작성 규칙

Step 6-1에서 수집한 커밋마다 **재현 가능한 시나리오 한 줄**로 변환한다.
커밋 제목을 그대로 옮기지 않는다.

| 커밋 예시                              | 체크리스트 항목                                                      |
| -------------------------------------- | -------------------------------------------------------------------- |
| `fix: Paxi 채팅 소켓 재연결 실패 수정` | `[ ] 채팅 중 비행기 모드 껐다 켠 뒤 메시지 전송이 되는지 확인`       |
| `feat: 학생단체 소개 탭 추가`          | `[ ] 홈 → 학생단체 탭 진입, 목록/상세 화면이 정상 표시되는지 확인`   |
| `fix: Android 16 뒤로가기 종료 수정`   | `[ ] Android 16 기기에서 뒤로가기 한 번에 앱이 종료되지 않는지 확인` |

- **플랫폼 한정 변경은 항목에 플랫폼을 명시한다.** (`iOS에서만`, `Android 16에서`)
- 인증·결제·푸시처럼 회귀 시 영향이 큰 영역이 변경됐다면, 해당 커밋이 없더라도
  주변 플로우(로그인 → 예약 → 알림 수신) 확인 항목을 추가한다.
- `refactor:` `ci:` `build(deps):`만 있는 릴리즈여도 체크리스트를 비우지 않는다.
  최소한 앱 실행 → 로그인 → 주요 탭 진입까지는 확인 항목으로 넣는다.

### 6-4. PR 생성

```bash
gh pr create --base main --title "release: vX.Y.Z" --body "$(cat <<'EOF'
<위 형식으로 작성한 본문>
EOF
)"
```

## Step 7: 머지

**사용자에게 머지 여부를 반드시 확인한 뒤** 진행한다. 이 저장소는 squash merge만
허용한다.

```bash
gh pr merge --squash
```

## Step 8: GitHub Release 생성

squash merge는 새 커밋을 만들므로, 브랜치가 아니라 **머지된 main 커밋**을 대상으로
Release를 만든다. `gh release create`가 태그도 함께 만들므로 `git tag`를 따로 하지 않는다.

본문에는 스토어 릴리즈 노트를 넣는다. 같은 세션에서 `/popo-release`를 먼저
실행했다면 그때 Step 4에서 생성한 노트를 **그대로** 재사용한다. 세션에 없다면
`popo-release.md` Step 4의 규칙(사용자 체감 변경만, 합쇼체, `•` 불렛)으로 다시 만든다.
`--generate-notes`는 쓰지 않는다(직접 커밋이 빠지고, 태그 누락 구간이 섞인다).

Full Changelog 링크의 시작점은 Step 6-1의 직전 범프 커밋이다(직전 태그가 없을 수 있음).

```bash
git fetch origin main
gh release create vX.Y.Z --target "$(git rev-parse origin/main)" --title vX.Y.Z --latest --notes "$(cat <<'EOF'
버그 수정
• Paxi 채팅을 오래 켜두면 메시지가 전송되지 않던 문제를 수정했습니다.
• 앱 안정성 및 보안을 개선했습니다.

**Full Changelog**: https://github.com/PoApper/popo-mobile/compare/<직전-범프-커밋>...vX.Y.Z
EOF
)"
```

Release 확인 후 로컬 브랜치를 정리한다.

```bash
git switch main && git pull
git branch -d release/vX.Y.Z
```
