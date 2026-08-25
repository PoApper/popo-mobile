# WebSocket 토큰 만료 재연결 — 인증 확정 신호 + 재연결 실패 안내

- 날짜: 2026-07-12
- 관련 PR: popo-mobile#293 (`feat/websocket-token-refresh`), paxi-popo-nest-api#154 (`refactor/websocket-error-event`)
- 상태: 설계 승인됨

## 배경

Paxi 채팅방(`NewChatScreen`) 소켓은 토큰 만료 시 리프레시 토큰으로
갱신 후 소켓을 재생성해 복구한다(PR #293). 코드 리뷰에서 이 복구 로직의
무한 루프 방어 가드가 실제로는 무력화된다는 사실이 확인되었다.

### 근본 원인

서버 `ChatGateway.handleConnection`은 **소켓 연결이 성립된 뒤** 실행되는
lifecycle 훅이다(핸드셰이크 미들웨어가 아님). 따라서:

1. 클라이언트 전송 계층 `'connect'` 이벤트가 **먼저** 발생한다.
2. 그 다음 서버가 토큰을 검증하고, 만료면 `accessTokenExpired`를 emit한 뒤
   `client.disconnect()`로 끊는다.

클라이언트 `onSocketConnected`(전송 `'connect'`에 바인딩)는
`reauthGuardRef.current.reauthCount = 0`으로 재인증 카운터를 리셋한다.
`'connect'`가 매 사이클 `accessTokenExpired`보다 먼저 발생하므로, 카운터는
매번 0으로 리셋되어 `maxAttempts`(기본 2)에 도달하지 못한다. 갱신된 토큰을
서버가 계속 거부하면(서버 시계 오차, 갱신이 유효 토큰을 반환하지 못하는 경우)
클라이언트는 `/auth/refresh` + 소켓 재생성을 **무한 반복**한다.

또한 가드가 상한에 도달하는 상황(원인 해결 후)에서는 재연결을 포기하지만,
`releaseSocket`이 리스너 제거 후 `disconnect`하므로 `onSocketDisconnected`가
발생하지 않아, 안내 배너가 뜨지 않고 입력창만 비활성으로 남는 사각지대가 있다.

## 목표

1. 전송 계층 연결과 **서버 인증 확정**을 구분해, 재인증 카운터가 실제로
   인증된 세션에서만 리셋되도록 한다(무한 루프 가드 복구).
2. 재연결을 포기했을 때(가드 상한 도달) 사용자에게 명확한 종료 상태를 안내한다.

## 비목표

- 배너의 레이아웃 배치(절대 위치 vs 레이아웃 흐름)는 재검토하지 않는다.
  PR #293이 흐름 배치로 바꾼 근거(노치/헤더 높이에서 `top:60` 어긋남)는
  타당하므로 유지하고, 실패 상태 문구만 기존 배너에 추가한다.
- 토큰 query string 제거(HANDOFF #5 보안 항목)는 이번 범위 밖.

## 설계

### A. 프로토콜 / 서버 (paxi-popo-nest-api, `refactor/websocket-error-event`)

인증 성공을 알리는 긍정 이벤트를 추가한다.

- `src/chat/chat.events.ts`: `ChatEvent` enum에 `CONNECTED = 'connected'` 추가.
  (`'connected'`는 socket.io 예약어가 아니다 — 예약어는
  `connect`/`disconnect`/`connect_error` — 충돌 없음.)
- `src/chat/chat.gateway.ts` `handleConnection`: 성공 경로에서
  `await client.join(\`user-${payload.uuid}\`)`**직후**`client.emit(ChatEvent.CONNECTED)`를 emit.
- 실패 경로(`accessTokenExpired` / `error` + `disconnect`)는 변경 없음.

### B. 클라이언트 배선 (popo-mobile)

- `src/constants/socket-events.ts`: `CONNECTED = 'connected'` 추가
  (서버 문자열과 정확히 일치해야 함).
- `src/utils/socket-factory.ts`: 전송 `'connect'`는 디버그 로그만 남기고,
  `onSocketConnected`는 서버 `connected` 이벤트에 바인딩한다.

  ```ts
  socket.on('connect', () => console.debug('전송 계층 연결 (인증 확정 전)'));
  socket.on(ChatEvent.CONNECTED, () => {
    console.debug('서버 인증 완료');
    onSocketConnected();
  });
  ```

  `socketFactory` 시그니처는 그대로. 어떤 소켓 이벤트가 콜백을 호출하는지만
  바뀐다.

- `NewChatScreen.onSocketConnected`의 기존 부수효과
  (`setSocketConnected(true)` / `reauthCount = 0` 리셋 / 재조회 /
  `POST /room/join`)는 유지된다(추가되는 `setReconnectFailed(false)`는 C 참조).
  다만 이제 서버 인증 확정 후에만 호출되므로 이 부수효과들이 곧 끊길 연결에서는
  실행되지 않는다. 핵심 수정은 **`reauthCount = 0` 리셋이 실제 인증된 세션에서만
  발생**한다는 점이며, 이로써 `maxAttempts` 가드가 복구된다.

### C. 재연결 실패 안내 (문구만, 버튼 없음)

- `src/utils/socket-reauth.ts`: `ReauthDeps`에 `onGiveUp?: () => void` 추가.
  `reauthCount >= maxAttempts` 분기에서 기존 `setSocketConnected?.(false)` +
  `releaseSocket()`와 함께 `deps.onGiveUp?.()` 호출.
- `NewChatScreen`:
  - `const [reconnectFailed, setReconnectFailed] = useState(false)` 추가.
  - `reconnectWithFreshToken(...)` deps에 `onGiveUp: () => setReconnectFailed(true)` 전달.
  - `onSocketConnected`에서 `setReconnectFailed(false)`(복구 시).
- 배너 상태(기존 `!socketConnected && reconnectAttempt !== 0` 대체):

  1. **연결됨** — `socketConnected` → 배너 없음, 입력창 활성.
  2. **재연결 중** — `!socketConnected && hasDisconnected && !reconnectFailed`
     → "연결이 끊어졌습니다. 재연결 중…".
  3. **실패** — `reconnectFailed`
     → "채팅 연결에 실패했습니다. 채팅방에 다시 입장해 주세요" (문구만).

  `onGiveUp`이 `reconnectFailed` 플래그를 직접 세우므로, `hasDisconnected`가
  세워지지 않은 사각지대에서도 종료 배너가 확실히 표시된다.

### D. 재입장 복구 (필수 추가)

재연결 실패 후 복구 경로는 "채팅방 재입장"이 유일하다. `useFocusEffect`가
포커스마다 재인증 가드를 초기화해야 재입장이 실제로 복구로 이어진다.

- `useFocusEffect` 콜백에서 기존
  `setSocketConnected(false)` / `setHasDisconnected(false)` 리셋과 함께:
  - `reauthGuardRef.current = createReauthGuard()` (또는
    `reauthCount = 0`, `isReauthing = false`),
  - `setReconnectFailed(false)`
    를 초기화한다.

이것이 없으면 리마운트 없이 재포커스만 되는 경우 `reauthCount`가 상한에 남아
첫 만료에서 즉시 다시 포기한다. 이 초기화로 재입장이 리마운트든 재포커스든
새 재연결 예산을 부여한다.

## 상태 모델 요약

| 상태      | 조건                                                      | 입력창 | 배너                                                    |
| --------- | --------------------------------------------------------- | ------ | ------------------------------------------------------- |
| 연결됨    | `socketConnected`                                         | 활성   | 없음                                                    |
| 재연결 중 | `!socketConnected && hasDisconnected && !reconnectFailed` | 비활성 | "연결이 끊어졌습니다. 재연결 중…"                       |
| 실패      | `reconnectFailed`                                         | 비활성 | "채팅 연결에 실패했습니다. 채팅방에 다시 입장해 주세요" |

## 정상/이상 흐름

- **정상 연결**: 전송 connect(디버그) → 서버 `connected` → `onSocketConnected`
  (연결 표시/조인/필요 시 재조회, `reauthCount = 0`).
- **토큰 만료 복구**: 전송 connect → 서버 `accessTokenExpired` →
  `reconnectWithFreshToken`(release → refresh → recreate) → 새 소켓 →
  서버 `connected` → `reauthCount = 0`. 정상 세션에서만 카운터 리셋.
- **반복 실패**: 인증 확정 없이 만료가 반복되면 `reauthCount`가 리셋되지 않고
  누적 → `maxAttempts` 도달 → `onGiveUp` → 실패 배너. 재입장으로만 복구.
- **갱신 실패**: `refreshAccessToken` 내부에서 `reset_auth` + 로그인 화면 이동
  (기존 동작 유지).

## 테스트

- `socket-reauth.test.ts`: `onGiveUp`이 상한 도달 시에만 호출되고 정상 경로에서는
  호출되지 않음을 검증하는 케이스 추가. 기존 8건 유지.
- `socket-factory.test.ts`: `connected` 이벤트에서 `onSocketConnected`가
  호출되고 전송 `'connect'`에서는 호출되지 않음을 검증하도록 갱신.
- 서버: `handleConnection` 성공 시 `connected` emit 검증(가능한 범위 내).
- 전체 `jest`, `npm run pc` 통과.

## 리스크 / 배포 순서

- 클라이언트가 서버의 `connected` emit에 의존한다. 클라이언트가 서버보다 먼저
  배포되면 `socketConnected`가 영영 true가 되지 않아 입력창이 비활성으로 남는다.
  두 PR은 **세트로 머지**되어야 하며(원 PR #293 명시), 서버 배포가 선행되거나
  동시여야 한다. 이 순서 제약을 릴리즈 시 반드시 확인한다.
