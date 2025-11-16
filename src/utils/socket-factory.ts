import {io} from 'socket.io-client';
import EncryptedStorage from 'react-native-encrypted-storage';
import {Socket} from 'socket.io-client';
import {PAXI_API_URL} from './paxi_api';
import { ChatEvent } from './socket-events';

const SOCKET_URL = PAXI_API_URL;

export const socketFactory = async (
  onSocketConnected: () => void,
  onSocketDisconnected: () => void,
): Promise<Socket> => {
  const token = (await EncryptedStorage.getItem('auth_token')) ?? '';
  const socket = io(`${SOCKET_URL}?Authentication=${token}`, {
    transports: ['websocket'],
    forceNew: true,
    reconnection: true,
    reconnectionDelay: 5000,
    reconnectionAttempts: Infinity,
    auth: {
      token: token,
    },
  });

  console.debug('웹소켓 연결 중...');

  socket.on('connect', () => {
    console.debug('웹소켓 연결 완료');
    onSocketConnected();
  });

  
  socket.on(ChatEvent.ACCESS_TOKEN_EXPIRED, () => {
    console.error('엑세스 토큰 만료');
    // TODO: 리프레시 토큰 이용해 갱신 후 웹소켓 재연결
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
