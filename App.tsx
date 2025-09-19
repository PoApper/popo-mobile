/**
 * POPO Mobile App
 */

import React, {useEffect} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';
import EncryptedStorage from 'react-native-encrypted-storage';
import notifee, {EventType} from '@notifee/react-native';
import {KeyboardProvider} from 'react-native-keyboard-controller';

import AppNavigator from './src/navigation/AppNavigator';
import {requestUserPermission} from './src/utils/firebase';
import {displayNotification} from './src/utils/notifee';
import {navigate, navigationRef} from './src/navigation/RootNavigation';

const App = () => {
  useEffect(() => {
    requestUserPermission();

    const handlePendingNavigation = async () => {
      const roomUuidData = await EncryptedStorage.getItem('roomUuid');
      let roomUuid: string | undefined;
      if (roomUuidData) {
        try {
          const parsed = JSON.parse(roomUuidData);
          roomUuid = parsed.roomUuid;
        } catch {
          roomUuid = roomUuidData;
        }
      }

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

    // handle delay of `setItem` in index.js
    setTimeout(handlePendingNavigation, 100);

    const unsubscribe = messaging().onMessage(remoteMessage => {
      // NOTE: On iOS simulator, the message is not received when Forground.
      displayNotification(
        remoteMessage.notification?.title as string,
        remoteMessage.notification?.body as string,
        remoteMessage.data,
      );
    });

    // 포어그라운드 알림 클릭 이벤트 리스너 등록
    notifee.onForegroundEvent(({type, detail}) => {
      if (type === EventType.PRESS) {
        const {notification} = detail;
        if (notification?.data?.roomUuid) {
          navigate('NewChat', {
            roomUuid: notification.data.roomUuid,
            from: 'roomList',
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <KeyboardProvider>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <AppNavigator />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </KeyboardProvider>
  );
};

export default App;
