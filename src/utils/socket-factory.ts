import {io} from 'socket.io-client';
import EncryptedStorage from 'react-native-encrypted-storage';
import {Socket} from 'socket.io-client';

const SOCKET_URL = 'https://api.paxi.popo-dev.poapper.club';

export const socketFactory = async (
  setSocketConnected: React.Dispatch<React.SetStateAction<boolean>>,
  setReconnectAttempt: React.Dispatch<React.SetStateAction<number>>,
  reconnectAttemptRef: React.RefObject<number>,
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

  function onSocketDisconnect() {
    reconnectAttemptRef.current += 1;
    setReconnectAttempt(reconnectAttemptRef.current);
    setSocketConnected(false);
  }

  console.debug('웹소켓 연결 중...');

  socket.on('connect', () => {
    console.debug('웹소켓 연결 완료');
    setSocketConnected(true);
    reconnectAttemptRef.current = 0;
    setReconnectAttempt(0);
  });

  socket.on('connect_error', error => {
    console.error('연결 에러 발생:', error.message);
    console.error(error.stack);
    onSocketDisconnect();
  });

  socket.on('error', error => {
    console.error('일반 에러 발생:', error.message);
    console.error(error.stack);
    onSocketDisconnect();
  });

  socket.on('disconnect', reason => {
    console.debug('웹소켓 연결 종료: ', reason);
    onSocketDisconnect();
  });

  return socket;
};
