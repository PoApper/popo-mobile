# WebSocket 토큰 만료 재연결 — 인증 확정 신호 + 재연결 실패 안내 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 서버가 인증 성공 시 `connected` 이벤트를 보내고, 클라이언트가 이 이벤트로만 재인증 카운터를 리셋해 무한 재연결 루프를 막고, 재연결 상한 도달 시 명확한 종료 안내를 표시한다.

**Architecture:** 서버 `ChatGateway.handleConnection`은 소켓 연결이 성립된 뒤 실행되므로 전송 계층 `connect`는 인증 확정이 아니다. 서버가 토큰 검증 성공 후 `connected` 이벤트를 emit하고, 클라이언트는 이 이벤트에 `onSocketConnected`를 바인딩한다. 재연결 상한 도달 시 `onGiveUp` 콜백으로 UI에 종료 상태를 알리고, 재입장(포커스) 시 가드를 초기화해 복구한다.

**Tech Stack:** NestJS + socket.io(서버), React Native + socket.io-client + Jest(클라이언트). 두 저장소에 걸친 변경.

**저장소 / 브랜치:**
- 서버: `~/university_life/PoApper/paxi-popo-nest-api`, 브랜치 `refactor/websocket-error-event`
- 클라이언트: `~/university_life/PoApper/popo-mobile/.worktrees/ws-token-refresh`, 브랜치 `feat/websocket-token-refresh`

**설계 문서:** `docs/superpowers/specs/2026-07-12-websocket-token-expiry-reconnect-design.md`

**배포 순서 주의:** 클라이언트가 서버의 `connected` emit에 의존한다. 서버 배포가 선행되거나 동시여야 하며, 두 PR은 세트로 머지한다.

---

## File Structure

**서버 (paxi-popo-nest-api):**
- Modify: `src/chat/chat.events.ts` — `CONNECTED` 이벤트 상수 추가
- Modify: `src/chat/chat.gateway.ts` — 인증 성공 시 `connected` emit
- Create: `src/chat/chat.gateway.spec.ts` — `handleConnection` 단위 테스트

**클라이언트 (popo-mobile):**
- Modify: `src/constants/socket-events.ts` — `CONNECTED` 상수 추가(서버와 일치)
- Modify: `src/utils/socket-factory.ts` — 전송 `connect`는 로그만, `connected`에 `onSocketConnected` 바인딩
- Modify: `src/utils/__tests__/socket-factory.test.ts` — `connected` 배선 테스트로 갱신
- Modify: `src/utils/socket-reauth.ts` — `onGiveUp` 콜백 추가
- Modify: `src/utils/__tests__/socket-reauth.test.ts` — `onGiveUp` 테스트 추가
- Modify: `src/screens/paxi/NewChatScreen.tsx` — `reconnectFailed` 상태 / 배너 / 포커스 가드 초기화

---

## Task 1: 서버 — 인증 성공 시 `connected` 이벤트 emit

**Files:**
- Modify: `~/university_life/PoApper/paxi-popo-nest-api/src/chat/chat.events.ts`
- Modify: `~/university_life/PoApper/paxi-popo-nest-api/src/chat/chat.gateway.ts` (성공 경로, `client.join` 직후)
- Create: `~/university_life/PoApper/paxi-popo-nest-api/src/chat/chat.gateway.spec.ts`

- [ ] **Step 1: 서버 브랜치 체크아웃**

Run:
```bash
cd ~/university_life/PoApper/paxi-popo-nest-api && git checkout refactor/websocket-error-event
```
Expected: `refactor/websocket-error-event` 브랜치로 전환(원격 추적 브랜치에서 로컬 생성). 작업트리에 `.omc/`, `CLAUDE.md` untracked만 있고 체크아웃을 막지 않음.

- [ ] **Step 2: 실패 테스트 작성**

Create `src/chat/chat.gateway.spec.ts`:
```ts
import { TokenExpiredError } from '@nestjs/jwt';

import { ChatGateway } from './chat.gateway';
import { ChatEvent } from './chat.events';

describe('ChatGateway.handleConnection', () => {
  const makeGateway = (verifyImpl: () => unknown) => {
    const jwtService = { verify: jest.fn(verifyImpl) } as unknown as never;
    const roomService = {} as never;
    const fcmService = {} as never;
    return new ChatGateway(jwtService, roomService, fcmService);
  };

  const makeClient = (token?: string) =>
    ({
      handshake: { query: { Authentication: token } },
      data: {},
      join: jest.fn().mockResolvedValue(undefined),
      emit: jest.fn(),
      disconnect: jest.fn(),
    }) as never as import('socket.io').Socket;

  it('인증 성공 시 connected 이벤트를 emit하고 연결을 끊지 않는다', async () => {
    const gateway = makeGateway(() => ({ uuid: 'user-1' }));
    const client = makeClient('valid-token');

    await gateway.handleConnection(client);

    expect(client.join).toHaveBeenCalledWith('user-user-1');
    expect(client.emit).toHaveBeenCalledWith(ChatEvent.CONNECTED);
    expect(client.disconnect).not.toHaveBeenCalled();
  });

  it('토큰 만료 시 accessTokenExpired를 emit하고 connected는 보내지 않는다', async () => {
    const gateway = makeGateway(() => {
      throw new TokenExpiredError('jwt expired', new Date());
    });
    const client = makeClient('expired-token');

    await gateway.handleConnection(client);

    expect(client.emit).toHaveBeenCalledWith(
      ChatEvent.ACCESS_TOKEN_EXPIRED,
      expect.objectContaining({ error: 'AccessTokenExpired' }),
    );
    expect(client.emit).not.toHaveBeenCalledWith(ChatEvent.CONNECTED);
    expect(client.disconnect).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: 테스트 실패 확인**

Run: `cd ~/university_life/PoApper/paxi-popo-nest-api && npx jest src/chat/chat.gateway.spec.ts`
Expected: FAIL — `ChatEvent.CONNECTED`가 없어 컴파일/단언 실패(`connected` emit 없음).

- [ ] **Step 4: `CONNECTED` 상수 추가**

`src/chat/chat.events.ts`에서 `ERROR = 'error',` 줄 바로 위(또는 방 이벤트 아래)에 연결 이벤트를 추가:
```ts
  // 연결 관련 이벤트
  CONNECTED = 'connected',

  // 에러 이벤트
  ERROR = 'error',
```

- [ ] **Step 5: `handleConnection` 성공 경로에서 emit**

`src/chat/chat.gateway.ts`의 성공 경로에서 `await client.join(...)` 직후에 추가:
```ts
      await client.join(`user-${payload.uuid}`);
      // 인증 성공 확정 신호. 클라이언트는 전송 계층 connect가 아니라 이 이벤트로
      // 실제 사용 가능 상태를 판단한다(만료 토큰이면 여기 도달하지 않고 끊김).
      client.emit(ChatEvent.CONNECTED);
```

- [ ] **Step 6: 테스트 통과 확인**

Run: `cd ~/university_life/PoApper/paxi-popo-nest-api && npx jest src/chat/chat.gateway.spec.ts`
Expected: PASS (2 tests).

- [ ] **Step 7: 커밋**

```bash
cd ~/university_life/PoApper/paxi-popo-nest-api
git add src/chat/chat.events.ts src/chat/chat.gateway.ts src/chat/chat.gateway.spec.ts
git commit -m "feat: 웹소켓 인증 성공 시 connected 이벤트 emit"
```

---

## Task 2: 클라이언트 — `connected` 이벤트로 소켓 인증 확정 처리

**Files:**
- Modify: `src/constants/socket-events.ts`
- Modify: `src/utils/socket-factory.ts:32-35` (`socket.on('connect', ...)`)
- Modify: `src/utils/__tests__/socket-factory.test.ts`

작업 디렉터리: `~/university_life/PoApper/popo-mobile/.worktrees/ws-token-refresh`

- [ ] **Step 1: 실패 테스트로 갱신**

`src/utils/__tests__/socket-factory.test.ts`에서 기존
`it('connect 이벤트에서 onSocketConnected를 호출한다', ...)` 블록을 아래 두 테스트로 교체:
```ts
  it('connected 이벤트에서 onSocketConnected를 호출한다', async () => {
    const {socket, onSocketConnected} = await setup();

    socket.trigger(ChatEvent.CONNECTED);

    expect(onSocketConnected).toHaveBeenCalledTimes(1);
  });

  it('전송 connect 이벤트로는 onSocketConnected를 호출하지 않는다', async () => {
    const {socket, onSocketConnected} = await setup();

    socket.trigger('connect');

    expect(onSocketConnected).not.toHaveBeenCalled();
  });
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm run test -- socket-factory`
Expected: FAIL — `ChatEvent.CONNECTED` 미정의 및 `connect` 트리거로 여전히 `onSocketConnected` 호출됨.

- [ ] **Step 3: 클라이언트 상수 추가**

`src/constants/socket-events.ts`에서 `// 에러 이벤트` 위에 추가:
```ts
  // 연결 관련 이벤트
  // 서버 handleConnection이 토큰 검증에 성공하면 보낸다. 전송 계층 connect가
  // 아니라 이 이벤트를 실제 사용 가능(인증 확정)으로 취급한다.
  CONNECTED = 'connected',

  // 에러 이벤트
  ERROR = 'error',
```

- [ ] **Step 4: socket-factory 배선 변경**

`src/utils/socket-factory.ts`의 아래 블록:
```ts
  socket.on('connect', () => {
    console.debug('웹소켓 연결 완료');
    onSocketConnected();
  });
```
을 다음으로 교체:
```ts
  socket.on('connect', () => {
    // 전송 계층 연결일 뿐 인증 확정이 아니다. 서버가 handleConnection에서 토큰을
    // 검증한 뒤 connected 이벤트를 보내야 실제 사용 가능 상태다.
    console.debug('웹소켓 전송 계층 연결 (인증 확정 전)');
  });

  socket.on(ChatEvent.CONNECTED, () => {
    console.debug('웹소켓 서버 인증 완료');
    onSocketConnected();
  });
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npm run test -- socket-factory`
Expected: PASS (기존 유지 + 신규 2건 포함 전부 통과).

- [ ] **Step 6: 커밋**

```bash
cd ~/university_life/PoApper/popo-mobile/.worktrees/ws-token-refresh
git add src/constants/socket-events.ts src/utils/socket-factory.ts src/utils/__tests__/socket-factory.test.ts
git commit -m "feat: 서버 connected 이벤트로 소켓 인증 확정 처리"
```

---

## Task 3: 클라이언트 — 재인증 상한 도달 시 `onGiveUp` 콜백 추가

**Files:**
- Modify: `src/utils/socket-reauth.ts` (`ReauthDeps` 타입, `maxAttempts` 분기)
- Modify: `src/utils/__tests__/socket-reauth.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

`src/utils/__tests__/socket-reauth.test.ts`의 `makeDeps`에 `onGiveUp` 추가:
```ts
const makeDeps = (overrides: Partial<ReauthDeps> = {}) => ({
  releaseSocket: jest.fn(),
  refreshAccessToken: jest.fn().mockResolvedValue(undefined),
  recreateSocket: jest.fn().mockResolvedValue(undefined),
  setSocketConnected: jest.fn(),
  onGiveUp: jest.fn(),
  ...overrides,
});
```
그리고 `describe('reconnectWithFreshToken', ...)` 안에 테스트 2건 추가:
```ts
  it('상한 도달로 중단할 때 onGiveUp을 호출한다', async () => {
    const deps = makeDeps();
    const guard = createReauthGuard();
    guard.reauthCount = 2; // 이미 상한 도달 상태

    await reconnectWithFreshToken(guard, {...deps, maxAttempts: 2});

    expect(deps.onGiveUp).toHaveBeenCalledTimes(1);
    expect(deps.recreateSocket).not.toHaveBeenCalled();
  });

  it('정상 재연결 경로에서는 onGiveUp을 호출하지 않는다', async () => {
    const deps = makeDeps();
    const guard = createReauthGuard();

    await reconnectWithFreshToken(guard, deps);

    expect(deps.onGiveUp).not.toHaveBeenCalled();
    expect(deps.recreateSocket).toHaveBeenCalledTimes(1);
  });
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm run test -- socket-reauth`
Expected: FAIL — `onGiveUp`이 호출되지 않아 `상한 도달로 중단할 때 onGiveUp을 호출한다` 실패.

- [ ] **Step 3: `ReauthDeps`에 `onGiveUp` 추가**

`src/utils/socket-reauth.ts`의 `ReauthDeps` 타입에서 `maxAttempts?` 위에 추가:
```ts
  // 재연결 진행 동안 연결 상태 표시 갱신 (선택)
  setSocketConnected?: (connected: boolean) => void;
  // 재연결을 포기했을 때(상한 도달) 호출. UI에 종료 상태를 알린다. (선택)
  onGiveUp?: () => void;
  // 정상 연결 없이 허용할 최대 갱신 횟수 (기본 2)
  maxAttempts?: number;
```

- [ ] **Step 4: `maxAttempts` 분기에서 `onGiveUp` 호출**

`src/utils/socket-reauth.ts`의 아래 분기:
```ts
    if (guard.reauthCount >= maxAttempts) {
      console.error('토큰 갱신 반복 실패 — 재연결 중단');
      // releaseSocket은 리스너 제거 후 disconnect하므로 disconnect 이벤트가
      // 발생하지 않는다. UI가 연결됨으로 남지 않도록 명시적으로 끊김 처리한다.
      deps.setSocketConnected?.(false);
      deps.releaseSocket();
      return;
    }
```
을 다음으로 교체(마지막에 `onGiveUp` 호출 추가):
```ts
    if (guard.reauthCount >= maxAttempts) {
      console.error('토큰 갱신 반복 실패 — 재연결 중단');
      // releaseSocket은 리스너 제거 후 disconnect하므로 disconnect 이벤트가
      // 발생하지 않는다. UI가 연결됨으로 남지 않도록 명시적으로 끊김 처리하고,
      // onGiveUp으로 종료 상태를 알린다(재입장으로만 복구).
      deps.setSocketConnected?.(false);
      deps.releaseSocket();
      deps.onGiveUp?.();
      return;
    }
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npm run test -- socket-reauth`
Expected: PASS (기존 8건 + 신규 2건).

- [ ] **Step 6: 커밋**

```bash
git add src/utils/socket-reauth.ts src/utils/__tests__/socket-reauth.test.ts
git commit -m "feat: 재인증 상한 도달 시 onGiveUp 콜백 추가"
```

---

## Task 4: 클라이언트 — 재연결 실패 안내 및 재입장 복구 처리

**Files:**
- Modify: `src/screens/paxi/NewChatScreen.tsx`

RN 화면이라 단위 테스트 없이 편집 후 수동 검증한다. 아래 5개 편집을 순서대로 적용한다.

- [ ] **Step 1: `reconnectFailed` 상태 추가**

`src/screens/paxi/NewChatScreen.tsx`에서
`const [hasDisconnected, setHasDisconnected] = useState<boolean>(false);` 아래에 추가:
```ts
  const [hasDisconnected, setHasDisconnected] = useState<boolean>(false);
  // 재인증 상한 도달로 재연결을 포기한 상태 (채팅방 재입장으로만 복구)
  const [reconnectFailed, setReconnectFailed] = useState<boolean>(false);
```

- [ ] **Step 2: `onSocketConnected`에서 실패 상태 해제**

`const onSocketConnected = async () => {` 본문의 `setSocketConnected(true);` 아래에 추가:
```ts
  const onSocketConnected = async () => {
    setSocketConnected(true);
    setReconnectFailed(false); // 정상 인증되면 실패 안내 해제
    reauthGuardRef.current.reauthCount = 0; // 정상 연결되면 토큰 갱신 카운터 초기화
```

- [ ] **Step 3: `onAccessTokenExpired` deps에 `onGiveUp` 전달**

`const onAccessTokenExpired = () =>` 블록을 다음으로 교체:
```ts
  const onAccessTokenExpired = () =>
    reconnectWithFreshToken(reauthGuardRef.current, {
      releaseSocket: releaseCurrentSocket,
      refreshAccessToken,
      recreateSocket: initSocket,
      setSocketConnected,
      onGiveUp: () => setReconnectFailed(true),
    });
```

- [ ] **Step 4: `useFocusEffect`에서 가드/실패 상태 초기화**

`useFocusEffect(useCallback(() => { ... }, []))`의 상단 초기화 블록을 다음으로 교체:
```ts
      // 포커스마다 새 소켓을 생성하므로 첫 connect를 최초 연결로 취급한다.
      hasConnectedOnceRef.current = false;
      // 재입장이 유일한 복구 경로이므로 재인증 가드를 새로 초기화한다.
      // (리마운트 없이 재포커스만 되는 경우에도 새 재연결 예산을 부여)
      reauthGuardRef.current = createReauthGuard();
      // 이전 세션의 연결 상태가 남아 끊김/실패 배너가 오표시되거나 입력창이
      // 잘못 활성화되지 않도록, 초기 connect 전까지 연결 UI 상태를 초기화한다.
      setSocketConnected(false);
      setHasDisconnected(false);
      setReconnectFailed(false);
```

- [ ] **Step 5: 배너 메시지 계산 + 렌더 교체**

`return (` 직전(예: `handleMyMsgClick` 정의 아래)에 배너 메시지 계산을 추가:
```ts
  const connectionBannerMessage = reconnectFailed
    ? '채팅 연결에 실패했습니다. 채팅방에 다시 입장해 주세요'
    : !socketConnected && hasDisconnected
    ? '연결이 끊어졌습니다. 재연결 중…'
    : null;
```
그리고 기존 배너 JSX 블록:
```tsx
      {!socketConnected && hasDisconnected && (
        <View style={styles.socketConnection}>
          <View
            style={[
              styles.socketConnectionInner,
              {backgroundColor: isDarkMode ? '#333' : '#eee'},
            ]}>
            <Icon
              name="link-off"
              size={18}
              color={isDarkMode ? '#FFFFFF' : '#000000'}
            />
            <Text style={{color: textColor(isDarkMode)}}>
              연결이 끊어졌습니다. 재연결 중…
            </Text>
          </View>
        </View>
      )}
```
을 다음으로 교체:
```tsx
      {connectionBannerMessage && (
        <View style={styles.socketConnection}>
          <View
            style={[
              styles.socketConnectionInner,
              {backgroundColor: isDarkMode ? '#333' : '#eee'},
            ]}>
            <Icon
              name="link-off"
              size={18}
              color={isDarkMode ? '#FFFFFF' : '#000000'}
            />
            <Text style={{color: textColor(isDarkMode)}}>
              {connectionBannerMessage}
            </Text>
          </View>
        </View>
      )}
```

- [ ] **Step 6: 타입체크/린트 확인**

Run: `npm run test && npx tsc --noEmit`
Expected: Jest 전체 통과, 타입 에러 없음. (`createReauthGuard`는 이미 import되어 있음.)

- [ ] **Step 7: 커밋**

```bash
git add src/screens/paxi/NewChatScreen.tsx
git commit -m "feat: 채팅 재연결 실패 안내 및 재입장 복구 처리"
```

---

## Task 5: 최종 검증 (양쪽 저장소)

**Files:** 없음(검증만)

- [ ] **Step 1: 클라이언트 전체 테스트 + pre-commit**

Run:
```bash
cd ~/university_life/PoApper/popo-mobile/.worktrees/ws-token-refresh
npm run test && npm run pc
```
Expected: Jest 전체 통과, `npm run pc`(format + lint + checks) 통과.

- [ ] **Step 2: 서버 전체 테스트**

Run:
```bash
cd ~/university_life/PoApper/paxi-popo-nest-api
npx jest
```
Expected: 전체 통과(신규 gateway spec 포함).

- [ ] **Step 3: 수동 시나리오 검증 (실기기/시뮬레이터, 서버 협조)**

짧은 만료 토큰으로 확인:
1. 정상 입장 → 전송 connect 후 `connected` 수신 → 입력창 활성, 배너 없음.
2. 토큰 만료 → `accessTokenExpired` → 갱신 → 재생성 → `connected` → 정상 복구, `reauthCount` 리셋.
3. 갱신해도 계속 만료(상한 2회 도달) → "채팅 연결에 실패했습니다. 채팅방에 다시 입장해 주세요" 배너 표시, 입력창 비활성.
4. 3 상태에서 채팅방 나갔다 재입장 → 가드 초기화되어 재연결 시도 재개.
5. 갱신 자체 실패 → 기존 로그인 화면 이동 흐름 유지.

---

## Self-Review 결과

- **Spec 커버리지:** A(서버 이벤트)=Task1, B(클라 배선)=Task2, C(onGiveUp+배너)=Task3·4, D(포커스 가드 초기화)=Task4 Step4, 테스트=Task1·2·3·Task5, 배포 순서=헤더에 명시. 누락 없음.
- **Placeholder:** 모든 스텝에 실제 코드/명령 포함. 없음.
- **타입 일관성:** `onGiveUp?: () => void`(Task3 정의) → Task4에서 동일 시그니처로 전달. `createReauthGuard`(기존 export)·`reconnectWithFreshToken`·`ReauthDeps` 명칭 일치. `ChatEvent.CONNECTED = 'connected'` 서버/클라 문자열 일치.
