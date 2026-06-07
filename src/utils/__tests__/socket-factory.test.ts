import EncryptedStorage from 'react-native-encrypted-storage';
import {io} from 'socket.io-client';
import {socketFactory} from '../socket-factory';
import {PAXI_API_URL} from '../paxi_api';
import {AUTH_TOKEN_KEY} from '../storage-keys';
import {ChatEvent} from '../../constants/socket-events';

// socket.io-client mock — io() 호출마다 핸들러를 기록하는 가짜 소켓을 만든다.
// 반환된 소켓의 trigger()로 서버 이벤트 수신을 시뮬레이션한다.
jest.mock('socket.io-client', () => {
  const makeSocket = () => {
    const handlers: Record<string, (...args: any[]) => void> = {};
    return {
      on: jest.fn((event: string, cb: (...args: any[]) => void) => {
        handlers[event] = cb;
      }),
      emit: jest.fn(),
      disconnect: jest.fn(),
      // 테스트 헬퍼: 등록된 핸들러를 강제로 호출
      trigger: (event: string, ...args: any[]) => handlers[event]?.(...args),
    };
  };
  return {io: jest.fn(() => makeSocket())};
});

const mockIo = io as jest.Mock;

type FakeSocket = Awaited<ReturnType<typeof socketFactory>> & {
  trigger: (event: string, ...args: any[]) => void;
};

const setup = async () => {
  const onSocketConnected = jest.fn();
  const onSocketDisconnected = jest.fn();
  const onAccessTokenExpired = jest.fn();
  const socket = (await socketFactory(
    onSocketConnected,
    onSocketDisconnected,
    onAccessTokenExpired,
  )) as FakeSocket;
  return {socket, onSocketConnected, onSocketDisconnected, onAccessTokenExpired};
};

beforeEach(async () => {
  jest.clearAllMocks();
  await EncryptedStorage.clear();
});

describe('socketFactory', () => {
  it('EncryptedStorage의 토큰을 URL 쿼리와 auth에 담아 연결한다', async () => {
    await EncryptedStorage.setItem(AUTH_TOKEN_KEY, 'my-token');

    await setup();

    expect(mockIo).toHaveBeenCalledWith(
      `${PAXI_API_URL}?Authentication=my-token`,
      expect.objectContaining({auth: {token: 'my-token'}}),
    );
  });

  it('토큰이 없으면 빈 문자열로 연결한다', async () => {
    await setup();

    expect(mockIo).toHaveBeenCalledWith(
      `${PAXI_API_URL}?Authentication=`,
      expect.objectContaining({auth: {token: ''}}),
    );
  });

  it('connect 이벤트에서 onSocketConnected를 호출한다', async () => {
    const {socket, onSocketConnected} = await setup();

    socket.trigger('connect');

    expect(onSocketConnected).toHaveBeenCalledTimes(1);
  });

  it('disconnect 이벤트에서 onSocketDisconnected를 호출한다', async () => {
    const {socket, onSocketDisconnected} = await setup();

    socket.trigger('disconnect', 'transport close');

    expect(onSocketDisconnected).toHaveBeenCalledTimes(1);
  });

  it('error 이벤트에서 onSocketDisconnected를 호출한다', async () => {
    const {socket, onSocketDisconnected} = await setup();

    socket.trigger(ChatEvent.ERROR, {message: 'boom', stack: 'stack'});

    expect(onSocketDisconnected).toHaveBeenCalledTimes(1);
  });

  it('accessTokenExpired 이벤트에서 onAccessTokenExpired를 호출한다', async () => {
    const {socket, onAccessTokenExpired} = await setup();

    socket.trigger(ChatEvent.ACCESS_TOKEN_EXPIRED);

    expect(onAccessTokenExpired).toHaveBeenCalledTimes(1);
  });

  it('accessTokenExpired는 일반 연결/해제 콜백을 호출하지 않는다', async () => {
    const {socket, onSocketConnected, onSocketDisconnected, onAccessTokenExpired} =
      await setup();

    socket.trigger(ChatEvent.ACCESS_TOKEN_EXPIRED);

    expect(onAccessTokenExpired).toHaveBeenCalledTimes(1);
    expect(onSocketConnected).not.toHaveBeenCalled();
    expect(onSocketDisconnected).not.toHaveBeenCalled();
  });
});
