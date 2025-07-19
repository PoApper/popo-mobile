import notifee, {AuthorizationStatus} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
// import {navigate} from '../navigation/RootNavigation';

// Notifee 기반 권한 요청
export const requestUserPermission = async () => {
  try {
    // notifee 권한 요청 (iOS/Android 모두 지원)
    const settings = await notifee.requestPermission();
    const enabled =
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
    return enabled;
  } catch (error) {
    console.error('Notifee permission request failed:', error);
    return false;
  }
};

// FCM 토큰 가져오기 (notifee는 자체적으로 토큰을 관리하지 않으므로 messaging 사용)
export const getFCMToken = async () => {
  let hasPermission: boolean;
  try {
    hasPermission = await requestUserPermission();
    if (!hasPermission) {
      console.log('Notification permissions not granted (notifee)');
      return null;
    }
    console.log('Notification permissions granted (notifee)');
  } catch (error: any) {
    console.error('Failed to request user permission (notifee):', error);
    return null;
  }

  try {
    console.log('Attempting to get FCM token (notifee)...');
    const fcmToken = await messaging().getToken();
    console.log('FCM token successfully retrieved (notifee)');
    return fcmToken;
  } catch (error: any) {
    console.error('Failed to get FCM token (notifee):', error);
    return null;
  }
};

// 토큰 갱신 이벤트 리스너 (notifee는 토큰 갱신 이벤트를 제공하지 않으므로 messaging 사용)
export const onTokenRefresh = (callback: (token: string) => void) => {
  return messaging().onTokenRefresh(token => {
    callback(token);
  });
};

// 알림 표시 함수 추가
export async function displayNotification(
  title: string,
  body: string,
  data?: any,
) {
  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId: 'default',
      pressAction: {
        id: 'default',
      },
    },
    data, // 알림에 데이터 추가
  });
}
