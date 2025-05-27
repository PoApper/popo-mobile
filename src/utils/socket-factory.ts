import {io} from 'socket.io-client';
import EncryptedStorage from 'react-native-encrypted-storage';

const SOCKET_URL = 'https://api.paxi-dev.popo.poapper.club';

export const socketFactory = async () => {
  const token = (await EncryptedStorage.getItem('auth_token')) ?? '';
  const socket = io(`${SOCKET_URL}?Authentication=${token}`, {
    transports: ['websocket'],
    forceNew: true,
    reconnection: true,
    query: {
      token: token,
    },
  });

  console.debug('웹소켓 연결 중...');

  socket.on('connect', () => {
    console.debug('웹소켓 연결 완료');
  });

  socket.on('connect_error', error => {
    console.error('연결 에러 발생:', error);
  });

  socket.on('error', error => {
    console.error('에러 발생:', error);
  });

  socket.on('disconnect', () => {
    console.debug('웹소켓 연결 종료');
  });

  return socket;
};
