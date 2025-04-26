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

const App = () => {
  useEffect(() => {
    const initializeFCM = async () => {
      const hasPermission = await requestUserPermission();
      if (hasPermission) {
        const token = await getFCMToken();
        if (token) {
          console.log('FCM Token:', token);
          // TODO: 여기에서 토큰을 서버에 전송
          // await sendTokenToServer(token);
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
