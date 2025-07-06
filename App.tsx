/**
 * POPO Mobile App
 */

import React, {useEffect} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import {requestUserPermission, getFCMToken} from './src/utils/firebase';
import paxi_api from './src/utils/paxi_api';
import messaging from '@react-native-firebase/messaging';
import {Alert} from 'react-native';

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

    const unsubscribe = messaging().onMessage(remoteMessage => {
      console.log('New FCM Token:', remoteMessage);
      Alert.alert(
        'New FCM Token:',
        `메시지를 받았습니다. ${remoteMessage.data?.title}`,
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
