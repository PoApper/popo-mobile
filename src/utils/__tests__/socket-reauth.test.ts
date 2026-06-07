import {
  createReauthGuard,
  reconnectWithFreshToken,
  ReauthDeps,
} from '../socket-reauth';

const makeDeps = (overrides: Partial<ReauthDeps> = {}) => ({
  releaseSocket: jest.fn(),
  refreshAccessToken: jest.fn().mockResolvedValue(undefined),
  recreateSocket: jest.fn().mockResolvedValue(undefined),
  setSocketConnected: jest.fn(),
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('createReauthGuard', () => {
  it('초기 상태는 비활성 + 카운트 0이다', () => {
    expect(createReauthGuard()).toEqual({isReauthing: false, reauthCount: 0});
  });
});

describe('reconnectWithFreshToken', () => {
  it('정리 → 토큰 갱신 → 소켓 재생성 순서로 실행한다', async () => {
    const order: string[] = [];
    const deps = makeDeps({
      releaseSocket: jest.fn(() => order.push('release')),
      refreshAccessToken: jest.fn(async () => {
        order.push('refresh');
      }),
      recreateSocket: jest.fn(async () => {
        order.push('recreate');
      }),
    });
    const guard = createReauthGuard();

    await reconnectWithFreshToken(guard, deps);

    expect(order).toEqual(['release', 'refresh', 'recreate']);
    expect(deps.setSocketConnected).toHaveBeenCalledWith(false);
    expect(guard.reauthCount).toBe(1);
    expect(guard.isReauthing).toBe(false); // 종료 후 가드 해제
  });

  it('진행 중이면 중복 호출을 무시한다 (이벤트 중복 수신 방어)', async () => {
    let resolveRefresh: () => void = () => {};
    const deps = makeDeps({
      refreshAccessToken: jest.fn(
        () =>
          new Promise<void>(resolve => {
            resolveRefresh = resolve;
          }),
      ),
    });
    const guard = createReauthGuard();

    const first = reconnectWithFreshToken(guard, deps); // 갱신 대기 중
    const second = reconnectWithFreshToken(guard, deps); // 무시되어야 함
    await second;

    expect(deps.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(deps.recreateSocket).not.toHaveBeenCalled();

    resolveRefresh();
    await first;

    expect(deps.recreateSocket).toHaveBeenCalledTimes(1);
    expect(guard.reauthCount).toBe(1);
  });

  it('정상 연결 없이 maxAttempts에 도달하면 재연결을 중단한다', async () => {
    const deps = makeDeps();
    const guard = createReauthGuard();

    // 연속 3회 — 1,2회는 시도, 3회째는 카운트 상한으로 중단
    await reconnectWithFreshToken(guard, deps);
    await reconnectWithFreshToken(guard, deps);
    await reconnectWithFreshToken(guard, deps);

    expect(deps.refreshAccessToken).toHaveBeenCalledTimes(2);
    expect(deps.recreateSocket).toHaveBeenCalledTimes(2);
    expect(guard.reauthCount).toBe(2);
    expect(guard.isReauthing).toBe(false);
  });

  it('정상 연결로 카운트가 초기화되면 다시 갱신을 시도한다', async () => {
    const deps = makeDeps();
    const guard = createReauthGuard();

    await reconnectWithFreshToken(guard, deps);
    await reconnectWithFreshToken(guard, deps);
    guard.reauthCount = 0; // 정상 연결 시 호출 측에서 초기화하는 동작 모사

    await reconnectWithFreshToken(guard, deps);

    expect(deps.refreshAccessToken).toHaveBeenCalledTimes(3);
  });

  it('maxAttempts는 인자로 조정할 수 있다', async () => {
    const deps = makeDeps();
    const guard = createReauthGuard();

    await reconnectWithFreshToken(guard, {...deps, maxAttempts: 1});
    await reconnectWithFreshToken(guard, {...deps, maxAttempts: 1});

    expect(deps.refreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it('토큰 갱신 실패 시 소켓만 정리하고 재생성하지 않는다', async () => {
    const deps = makeDeps({
      refreshAccessToken: jest.fn().mockRejectedValue(new Error('refresh 실패')),
    });
    const guard = createReauthGuard();

    await reconnectWithFreshToken(guard, deps);

    expect(deps.recreateSocket).not.toHaveBeenCalled();
    expect(deps.releaseSocket).toHaveBeenCalledTimes(2); // 갱신 전 + 실패 후
    expect(guard.isReauthing).toBe(false); // 실패해도 가드 해제
  });

  it('소켓 재생성 실패 시에도 가드를 해제한다', async () => {
    const deps = makeDeps({
      recreateSocket: jest.fn().mockRejectedValue(new Error('recreate 실패')),
    });
    const guard = createReauthGuard();

    await reconnectWithFreshToken(guard, deps);

    expect(guard.isReauthing).toBe(false);
    expect(deps.releaseSocket).toHaveBeenCalledTimes(2);
  });
});
