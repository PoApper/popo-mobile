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
import {ThemeProvider} from './src/styles/theme';
import {requestUserPermission} from './src/utils/firebase';
import paxi_api from './src/utils/paxi_api';
import {displayNotification} from './src/utils/notifee';
import {navigationRef} from './src/navigation/RootNavigation';
import {isRoomMuted} from './src/utils/mute';

const App = () => {
  useEffect(() => {
    requestUserPermission();

    const joinAndNavigate = async (
      roomUuid?: string,
      from: 'roomList' | 'myReservation' = 'roomList',
    ) => {
      if (!roomUuid) return;
      try {
        await paxi_api.post(`/room/join/${roomUuid}`);
      } catch (e) {
        // 실패해도 방으로 이동은 시도
      }

      const go = () => {
        if (navigationRef.isReady()) {
          navigationRef.current?.navigate('NewChat', {roomUuid, from});
        } else {
          setTimeout(go, 100);
        }
      };
      go();
    };

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
        await joinAndNavigate(roomUuid, from);
        EncryptedStorage.removeItem('roomUuid');
        EncryptedStorage.removeItem('pendingNavigation');
      }
    };

    // handle delay of `setItem` in index.js
    setTimeout(handlePendingNavigation, 100);

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // NOTE: On iOS simulator, the message is not received when Forground.
      const roomUuid = remoteMessage.data?.roomUuid as string | undefined;
      if (roomUuid && (await isRoomMuted(roomUuid))) {
        return;
      }
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
          joinAndNavigate(notification.data.roomUuid, 'roomList');
        }
      }
    });

    // 백그라운드 알림 클릭(앱이 백그라운드에서 열릴 때)
    const unsubscribeOpened = messaging().onNotificationOpenedApp(
      remoteMessage => {
        const roomUuid = remoteMessage?.data?.roomUuid as string | undefined;
        if (roomUuid) {
          joinAndNavigate(roomUuid, 'roomList');
        }
      },
    );

    // 종료 상태에서 알림 클릭으로 실행된 경우 처리
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        const roomUuid = remoteMessage?.data?.roomUuid as string | undefined;
        if (roomUuid) {
          joinAndNavigate(roomUuid, 'roomList');
        }
      })
      .catch(() => {});

    return () => {
      unsubscribe();
      unsubscribeOpened();
    };
  }, []);

  return (
    <ThemeProvider>
      <KeyboardProvider>
        <GestureHandlerRootView>
          <SafeAreaProvider>
            <AppNavigator />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </KeyboardProvider>
    </ThemeProvider>
  );
};

export default App;
