import {io} from 'socket.io-client';
import EncryptedStorage from 'react-native-encrypted-storage';
import {Socket} from 'socket.io-client';
import { PAXI_API_URL } from './paxi_api';

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

  socket.on('connect_error', error => {
    console.error('연결 에러 발생:', error.message);
    console.error(error.stack);
    onSocketDisconnected();
  });

  socket.on('error', error => {
    console.error('일반 에러 발생:', error.message);
    console.error(error.stack);
    onSocketDisconnected();
  });

  socket.on('disconnect', reason => {
    console.debug('웹소켓 연결 종료: ', reason);
    onSocketDisconnected();
  });

  return socket;
};
