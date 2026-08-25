import {adoptFreshSocket, AdoptDeps} from '../socket-adopt';
import {Socket} from 'socket.io-client';

// 실제 소켓 대신 식별 가능한 더미. adopt/dispose 인자 검증용.
const fakeSocket = {id: 'fresh'} as unknown as Socket;

const makeDeps = (overrides: Partial<AdoptDeps> = {}): AdoptDeps => ({
  create: jest.fn().mockResolvedValue(fakeSocket),
  isFocused: jest.fn().mockReturnValue(true),
  releaseCurrent: jest.fn(),
  adopt: jest.fn(),
  dispose: jest.fn(),
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('adoptFreshSocket', () => {
  it('포커스 상태면 이전 소켓 정리 후 새 소켓을 채택한다', async () => {
    const order: string[] = [];
    const deps = makeDeps({
      releaseCurrent: jest.fn(() => order.push('release')),
      adopt: jest.fn(() => order.push('adopt')),
    });

    await adoptFreshSocket(deps);

    // 경쟁 소켓 릭 방지: 반드시 release가 adopt보다 먼저
    expect(order).toEqual(['release', 'adopt']);
    expect(deps.adopt).toHaveBeenCalledWith(fakeSocket);
    expect(deps.dispose).not.toHaveBeenCalled();
  });

  it('create await 사이 언포커스되면 새 소켓을 버리고 채택하지 않는다', async () => {
    let resolveCreate: (s: Socket) => void = () => {};
    const isFocused = jest.fn().mockReturnValue(true);
    const deps = makeDeps({
      create: jest.fn(
        () =>
          new Promise<Socket>(resolve => {
            resolveCreate = resolve;
          }),
      ),
      isFocused,
    });

    const pending = adoptFreshSocket(deps); // create 대기 중
    isFocused.mockReturnValue(false); // await 사이 blur (cleanup이 돎)
    resolveCreate(fakeSocket);
    await pending;

    expect(deps.dispose).toHaveBeenCalledWith(fakeSocket);
    expect(deps.adopt).not.toHaveBeenCalled();
    expect(deps.releaseCurrent).not.toHaveBeenCalled();
  });
});
