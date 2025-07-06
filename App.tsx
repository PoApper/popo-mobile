/**
 * POPO Mobile App
 */

import React, {useEffect} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import {
  requestUserPermission,
  getFCMToken,
  displayNotification,
} from './src/utils/firebase';
import paxi_api from './src/utils/paxi_api';
import messaging from '@react-native-firebase/messaging';
import EncryptedStorage from 'react-native-encrypted-storage';
import {navigationRef} from './src/navigation/RootNavigation';

const App = () => {
  useEffect(() => {
    const initializeFCM = async () => {
      const hasPermission = await requestUserPermission();
      if (hasPermission) {
        const token = await getFCMToken();
        if (token) {
          paxi_api
            .post('/push/key/', {
              key: token,
            })
            .then(res => {
              console.log('토큰 전송 성공', res);
            })
            .catch(err => {
              const msg = err.response.data.message;
              console.log('토큰 전송 실패', msg);
            });
        }
      }
    };

    initializeFCM();

    const handlePendingNavigation = async () => {
      // const pendingNavigation = await EncryptedStorage.getItem('pendingNavigation'); // for debug
      const roomUuid = await EncryptedStorage.getItem('roomUuid');

      // roomUuid가 있으면 NewChat 스크린으로 이동
      if (roomUuid) {
        const navigateToChat = () => {
          if (navigationRef.isReady()) {
            navigationRef.current?.navigate('NewChat', {roomUuid});
            // 사용 후 저장된 값 삭제
            EncryptedStorage.removeItem('roomUuid');
            EncryptedStorage.removeItem('pendingNavigation');
          } else {
            // 네비게이션이 아직 준비되지 않았으면 다시 시도
            setTimeout(navigateToChat, 100);
          }
        };

        // 네비게이션 시도 시작
        navigateToChat();
      }
    };
    handlePendingNavigation();

    const unsubscribe = messaging().onMessage(remoteMessage => {
      // NOTE: On iOS simulator, the message is not received when Forground.
      displayNotification(
        remoteMessage.notification?.title as string,
        remoteMessage.notification?.body as string,
      );
    });

    return () => unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
