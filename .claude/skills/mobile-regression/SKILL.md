---
name: mobile-regression
description: 앱 코드(src/, index.js, android/, ios/)를 바꾼 PR을 만들거나 갱신하기 전에 반드시 실행한다. 변경 영향 화면과 신규 화면을 iOS 시뮬레이터·Android 에뮬레이터에서 한국어·영어로 Maestro로 돌려 스크린샷을 찍고 PR 본문에 첨부한다. 사용자가 따로 요청하지 않아도 PR 작업이면 적용한다.
---

# 모바일 회귀 테스트 + PR 스크린샷

PR이 바꾼 화면을 실제 앱으로 띄워 확인하고, 확인한 화면을 전부 PR 본문에 첨부한다.
단위 테스트가 못 잡는 것(영어 문구 줄바꿈, 잘림, 겹침, 빈 화면)을 잡는 게 목적이다.

## 언제

- `src/`, `index.js`, `android/`, `ios/`를 바꾼 PR을 **만들기 전**, 그리고 UI가 바뀌는 커밋을 **푸시할 때마다**.
- 문서·CI·`.claude/`만 바꾼 PR은 건너뛴다.

## 0. 준비 (처음 한 번)

- `brew install mobile-dev-inc/tap/maestro` (Java 17 필요)
- `cp e2e/.env.example e2e/.env.local` 후 dev 서버 테스트 계정을 iOS용·Android용으로 하나씩 입력. 계정을 모르면 사용자에게 묻는다. 계정을 바꾸면 기기의 앱이 이전 계정으로 로그인돼 있으니 앱에서 로그아웃하거나 앱 데이터를 지운다. **레포가 public이므로 계정을 커밋하거나 PR·로그에 남기지 않는다.**
- Metro: `npm run start` (백그라운드)

## 1. 범위 정하기

`git diff --name-only main...HEAD`로 바뀐 파일을 보고, 화면 단위로 확인 목록을 만든다.

- **회귀**: 바뀐 컴포넌트를 쓰는 기존 화면. 컴포넌트는 import한 화면까지 따라간다(`grep -rn "from '@components/…'" src`).
- **신규**: 새 화면·모달·상태. 새로 생긴 경로는 `src/navigation/types.ts`에서 찾는다.
- **상태**: 빈 목록/데이터 있음, 처리 중/완료, 방장/참여자처럼 분기가 있는 화면은 분기마다 본다.
- 문구를 바꿨으면 한국어·영어 둘 다 본다(기본값이 둘 다다).

## 2. 흐름 고르기·쓰기

`e2e/flows/`에 있는 흐름을 먼저 재사용하고, 없으면 새로 쓴다. 새 흐름은 **PR에 같이 커밋**한다. 다음 PR의 회귀 테스트가 된다.

- 위치: `e2e/flows/<영역>/<화면>.yaml` (예: `e2e/flows/paxi/report-list.yaml`)
- 시작은 항상 `common/launch.yaml`(앱 재시작·LogBox 끄기·로그인) → `common/set-language.yaml`.
- `takeScreenshot` 바로 앞에는 항상 `waitForAnimationToEnd`(timeout 5000)를 둔다. 없으면 Android에서 탭 직후 이전 화면이나 로딩 중 화면이 찍힌다. 목록처럼 불러오는 동안 빈 상태가 먼저 보이는 화면은 내용이 뜰 때까지 `extendedWaitUntil`(`optional: true`)로 기다린다.
- 스크린샷 이름: `<영역>-<화면>-<상태>-${LANGUAGE}` (예: `paxi-report-detail-resolved-${LANGUAGE}`). 이름이 PR 캡션이 된다.
- 선택자는 `id`(= RN `testID`) 우선. 문구는 언어마다 달라지고, iOS 탭은 접근성 라벨이 `"Home, tab, 1 of 4"`처럼 붙는다. 필요한 `testID`는 컴포넌트에 추가한다(별도 커밋).
- iOS는 누를 수 있는 카드(`TouchableOpacity`) 안의 문구를 하나의 접근성 라벨로 합친다(예: `"ADLIB, 연극"`, 아이콘 글리프가 앞에 붙기도 함). 카드 안 문구는 `'.*ADLIB.*'`처럼 정규식으로 맞춘다. Android는 문구마다 따로 잡혀 두 플랫폼 모두 통과한다.
- 언어별 문구가 필요하면 `"${LANGUAGE == 'en' ? 'Report' : '신고'}"`처럼 쓴다(따옴표로 감싸야 YAML이 파싱된다).
- 참고: `smoke.yaml`, Maestro 문서 https://docs.maestro.dev . 화면 구조는 `maestro --device <id> hierarchy`로 본다.

```yaml
appId: ${APP_ID}
name: report-list
---
- runFlow: ../common/launch.yaml
- runFlow: ../common/set-language.yaml
- scrollUntilVisible:
    element: "${LANGUAGE == 'en' ? 'View' : '내역 조회'}"
- tapOn: "${LANGUAGE == 'en' ? 'View' : '내역 조회'}"
- waitForAnimationToEnd:
    timeout: 5000
- takeScreenshot: paxi-report-list-${LANGUAGE}
```

## 3. 실행

```bash
e2e/run.sh e2e/flows/smoke.yaml e2e/flows/<영역>/<화면>.yaml   # 기본: ios+android × ko+en
e2e/run.sh --build ...        # 네이티브 코드·매니페스트·Info.plist를 바꿨을 때
e2e/run.sh --platforms android --languages en e2e/flows/...    # 흐름 작성 중 빠른 반복
e2e/run.sh --keep --platforms ios e2e/flows/<영역>/<화면>.yaml   # 실패한 조합만 다시(다른 캡처는 남긴다)
```

- iOS와 Android는 동시에 돈다. 출력 줄은 섞여 나오므로 결과는 `summary.txt`로 본다.
- `--keep` 없이 돌리면 `e2e/output/`을 비운다. 새 PR의 첫 실행은 `--keep` 없이 해야 이전 PR 캡처가 섞이지 않는다.
- `smoke.yaml`은 모든 PR에서 같이 돌린다.
- 결과: `e2e/output/<platform>-<이름>.png`, `e2e/output/summary.txt`, 실패 로그 `e2e/output/.raw/*.log`.
- 실패하면: 앱 회귀면 코드를 고친다. 선택자·타이밍 문제면 흐름을 고친다. **실패를 숨기려고 흐름에서 검사를 빼지 않는다.**

## 4. 캡처를 직접 본다

`e2e/output/*.png`를 **전부 열어서** 눈으로 확인한다. 통과(PASS)는 "눌렀다"는 뜻일 뿐이다.

- 영어에서 버튼·라벨이 두 줄로 꺾이거나 글자 단위로 끊기는지
- 잘림, 겹침, 빈 화면, 번역 키가 그대로 보이는지(`paxi.report.title` 같은 문자열)
- 문제가 있으면 고치고 3부터 다시.

## 5. 흐름으로 못 띄우는 것

서버 실패 Alert, 특정 데이터가 있어야 보이는 상태처럼 흐름으로 재현할 수 없는 항목은 억지로 꾸미지 않는다.

- 임시 코드로 상태를 띄워 찍었다면(모달 visible 초기값 변경 등) 반드시 되돌리고, PR에 그렇게 확인했다고 적는다. 직접 찍은 캡처도 `e2e/output/<platform>-<이름>.png`로 넣으면 같이 올라간다.
- 끝까지 못 본 항목은 `e2e/output/unverified.md`에 목록으로 적는다. PR에 "미확인 항목"으로 실린다.
- dev 서버는 공용이다. 신고·정산 요청·추방처럼 다른 사람에게 영향을 주는 동작은 실제로 보내지 않는다. 테스트용으로 만든 데이터는 PR에 적는다.

## 6. PR에 올리기

PR을 만든 뒤(또는 이미 있으면 바로):

```bash
e2e/publish.sh            # 현재 브랜치의 PR
e2e/publish.sh 337        # PR 번호 지정
```

- PR별 secret gist에 이미지를 올리고, PR 본문의 `<!-- e2e-screenshots:start -->`~`end` 구역을 덮어쓴다(없으면 맨 끝에 붙인다). 여러 번 실행해도 중복되지 않는다.
- PR 본문의 테스트 항목에는 어떤 흐름을 돌렸고 무엇을 고쳤는지 한두 줄로 적는다.

## 7. 정리

검증이 끝나면 기기를 끈다: `adb emu kill; xcrun simctl shutdown all`
