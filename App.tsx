/**
 * POPO Mobile App
 */

import React, {useCallback, useEffect, useState} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';
import EncryptedStorage from 'react-native-encrypted-storage';
import {KeyboardProvider} from 'react-native-keyboard-controller';

import AppNavigator from './src/navigation/AppNavigator';
import {ThemeProvider} from './src/styles/theme';
import {requestUserPermission} from './src/utils/firebase';
import {registerPushKey} from './src/utils/push-key';
import paxi_api from './src/utils/paxi_api';
import {navigationRef} from './src/navigation/RootNavigation';
import {IS_AUTHENTICATED_KEY} from './src/utils/storage-keys';
import {isViewingRoom, PushBannerMessage} from './src/utils/push-banner';
import InAppPushBanner from './src/components/InAppPushBanner';

// 알림을 누르면 방에 참여한 뒤 채팅방으로 이동한다.
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

const App = () => {
  const [pushBanner, setPushBanner] = useState<PushBannerMessage | null>(null);
  const closePushBanner = useCallback(() => setPushBanner(null), []);

  useEffect(() => {
    const isLoggedIn = async () =>
      (await EncryptedStorage.getItem(IS_AUTHENTICATED_KEY)) === 'true';

    // 로그인 상태면 FCM 토큰 등록(권한 요청 포함), 아니면 권한만 요청
    isLoggedIn()
      .then(async loggedIn => {
        if (loggedIn) {
          await registerPushKey();
        } else {
          await requestUserPermission();
        }
      })
      .catch(error => console.error('[FCM] register failed:', error));

    // 앱을 보고 있을 때는 시스템 알림 대신 인앱 배너로 보여 준다. 그 방을 이미 보고 있으면 띄우지 않는다.
    const unsubscribe = messaging().onMessage(remoteMessage => {
      const title = remoteMessage.notification?.title;
      const roomUuid = remoteMessage.data?.roomUuid;
      const room = typeof roomUuid === 'string' ? roomUuid : undefined;
      if (!title || isViewingRoom(navigationRef.getCurrentRoute(), room)) {
        return;
      }
      setPushBanner({
        id: remoteMessage.messageId ?? String(Date.now()),
        title,
        body: remoteMessage.notification?.body,
        roomUuid: room,
      });
    });

    // 백그라운드 알림 클릭(앱이 백그라운드에서 열릴 때)
    const unsubscribeOpened = messaging().onNotificationOpenedApp(
      remoteMessage => {
        const roomUuid = remoteMessage?.data?.roomUuid;
        if (typeof roomUuid === 'string') {
          joinAndNavigate(roomUuid, 'roomList');
        }
      },
    );

    // 종료 상태에서 알림 클릭으로 실행된 경우 처리
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        const roomUuid = remoteMessage?.data?.roomUuid;
        if (typeof roomUuid === 'string') {
          joinAndNavigate(roomUuid, 'roomList');
        }
      })
      .catch(() => {});

    // FCM 토큰이 갱신되면 새 토큰을 서버에 등록
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
      isLoggedIn()
        .then(async loggedIn => {
          if (loggedIn) {
            await registerPushKey(token);
          }
        })
        .catch(error => console.error('[FCM] register failed:', error));
    });

    return () => {
      unsubscribe();
      unsubscribeOpened();
      unsubscribeTokenRefresh();
    };
  }, []);

  return (
    <ThemeProvider>
      <KeyboardProvider>
        <GestureHandlerRootView>
          <SafeAreaProvider>
            <AppNavigator />
            {pushBanner && (
              <InAppPushBanner
                key={pushBanner.id}
                message={pushBanner}
                onPress={() => {
                  closePushBanner();
                  joinAndNavigate(pushBanner.roomUuid);
                }}
                onClose={closePushBanner}
              />
            )}
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </KeyboardProvider>
    </ThemeProvider>
  );
};

export default App;
