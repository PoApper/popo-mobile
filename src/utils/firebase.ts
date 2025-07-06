import messaging from '@react-native-firebase/messaging';
import {Platform, PermissionsAndroid} from 'react-native';

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
