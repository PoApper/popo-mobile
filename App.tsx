/**
 * POPO Mobile App
 */

import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import {
  requestUserPermission,
  getFCMToken,
  onTokenRefresh,
} from './src/utils/firebase';
import paxi_api from './src/utils/paxi_api';

const App = () => {
  useEffect(() => {
    const initializeFCM = async () => {
      const hasPermission = await requestUserPermission();
      if (hasPermission) {
        const token = await getFCMToken();
        if (token) {
          // console.log('FCM Token:', token);
          paxi_api
            .post(`/push/key/${token}`)
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

    // 토큰 갱신 리스너 설정
    const unsubscribe = onTokenRefresh(newToken => {
      console.log('New FCM Token:', newToken);
      // TODO: 여기에서 새로운 토큰을 서버에 전송
      // await sendTokenToServer(newToken);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App;
