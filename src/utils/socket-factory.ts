import {io} from 'socket.io-client';
import EncryptedStorage from 'react-native-encrypted-storage';
import {Socket} from 'socket.io-client';
import {PAXI_API_URL} from './paxi_api';
import {AUTH_TOKEN_KEY} from './storage-keys';
import {ChatEvent} from '../constants/socket-events';

const SOCKET_URL = PAXI_API_URL;

export const socketFactory = async (
  onSocketConnected: () => void,
  onSocketDisconnected: () => void,
  onAccessTokenExpired: () => void,
): Promise<Socket> => {
  const token = (await EncryptedStorage.getItem(AUTH_TOKEN_KEY)) ?? '';
  const socket = io(`${SOCKET_URL}?Authentication=${token}`, {
    transports: ['websocket'],
    forceNew: true,
    reconnection: true,
    reconnectionDelay: 5000,
    // 점증 백오프: 5s에서 시작해 시도마다 늘어나 최대 30s에서 캡.
    // 고정 5s 재시도는 장애 시 서버에 불필요한 부하를 준다.
    reconnectionDelayMax: 30000,
    reconnectionAttempts: Infinity,
    auth: {
      token: token,
    },
  });

  console.debug('웹소켓 연결 중...');

  socket.on('connect', () => {
    // 전송 계층 연결일 뿐 인증 확정이 아니다. 서버가 handleConnection에서 토큰을
    // 검증한 뒤 connected 이벤트를 보내야 실제 사용 가능 상태다.
    console.debug('웹소켓 전송 계층 연결 (인증 확정 전)');
  });

  socket.on(ChatEvent.CONNECTED, () => {
    console.debug('웹소켓 서버 인증 완료');
    onSocketConnected();
  });

  socket.on(ChatEvent.ACCESS_TOKEN_EXPIRED, () => {
    console.error('액세스 토큰 만료 — 갱신 후 웹소켓 재연결 시도');
    // 토큰이 URL 쿼리에 박혀 생성 시점에만 읽히므로, 자동 재연결로는
    // 만료된 토큰이 그대로 재사용된다. 소켓 소유자가 토큰을 갱신하고
    // 소켓을 재생성하도록 위임한다.
    onAccessTokenExpired();
  });

  socket.on(ChatEvent.ERROR, error => {
    console.error('웹소켓 에러 발생:', error.message);
    console.error(error.stack);
    onSocketDisconnected();
  });

  socket.on('disconnect', reason => {
    console.debug('웹소켓 연결 종료: ', reason);
    onSocketDisconnected();
  });

  return socket;
};
