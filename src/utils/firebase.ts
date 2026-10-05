import messaging from '@react-native-firebase/messaging';
import {Platform, PermissionsAndroid} from 'react-native';
import notifee from '@notifee/react-native';
import paxi_api from './paxi_api';

/**
 * NOTE: On iOS simulator, the message is not received when Forground.
 * But, it is received when Background.
 * Both are received on real iOS device.
 */

// Firebase 메시징 권한 요청
export const requestUserPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      // Android 13 (API 33) 이상에서는 알림 권한 명시적 요청 필요
      if (Platform.Version >= 33) {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: '알림 권한',
            message: '푸시 알림을 받기 위해서는 알림 권한이 필요합니다.',
            buttonNeutral: '나중에 묻기',
            buttonNegative: '거부',
            buttonPositive: '허용',
          },
        );
        return permission === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    }

    if (Platform.OS === 'ios') {
      // iOS에서 디바이스를 원격 메시지용으로 등록
      await messaging().registerDeviceForRemoteMessages();

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      return enabled;
    }

    return false;
  } catch (error) {
    console.error('Permission request failed:', error);
    return false;
  }
};

// Firebase 메시징 토큰 가져오기
export const getFCMToken = async () => {
  // 1. 권한 요청 단계
  let hasPermission: boolean;
  try {
    hasPermission = await requestUserPermission();
    if (!hasPermission) {
      console.log('Notification permissions not granted');
      return null;
    }
    console.log('Notification permissions granted');
  } catch (error: any) {
    console.error('Failed to request user permission:', error);
    return null;
  }

  // 3. FCM 토큰 가져오기 단계
  try {
    console.log('Attempting to get FCM token...');
    const fcmToken = await messaging().getToken();
    console.log('FCM token successfully retrieved');
    return fcmToken;
  } catch (error: any) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
};

// FCM 토큰을 Paxi 서버에 등록 (이미 등록된 토큰이면 서버가 204를 반환하므로 반복 호출해도 안전)
export const registerFCMToken = async (token?: string) => {
  const fcmToken = token ?? (await getFCMToken());
  if (fcmToken) {
    await paxi_api.post('/push/key/', {key: fcmToken});
  }
};

// 로그아웃 시 이 기기의 FCM 토큰을 서버에서 삭제해 다음 사용자에게 이전 계정 푸시가 가지 않게 한다.
// 인증 쿠키가 필요하므로 토큰을 지우기 전에 호출해야 하며, 실패해도 로그아웃은 막지 않는다.
export const unregisterFCMToken = async () => {
  try {
    const fcmToken = await messaging().getToken();
    await paxi_api.delete('/push/key', {params: {key: fcmToken}});
  } catch (error) {
    console.error('[FCM] unregister failed:', error);
  }
};

export const displayNotification = async (title: string, body: string) => {
  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId,
    },
  });
};
