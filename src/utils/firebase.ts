import messaging from '@react-native-firebase/messaging';
import {Platform, PermissionsAndroid} from 'react-native';
import DeviceInfo from 'react-native-device-info';

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

  // 2. 시뮬레이터/에뮬레이터 체크
  const isEmulator = await DeviceInfo.isEmulator();
  if (isEmulator) {
    if (Platform.OS === 'ios') {
      console.warn(
        'iOS Simulator detected: FCM tokens are not available in simulator',
      );
      return null;
    } else if (Platform.OS === 'android') {
      console.warn(
        'Android Emulator detected: FCM may not work properly without Google Play Services',
      );
      // Android 에뮬레이터에서는 계속 시도해볼 수 있도록 함 (Google Play Services가 있을 수도 있음)
    }
  }

  // 3. FCM 토큰 가져오기 단계
  try {
    console.log('Attempting to get FCM token...');
    const fcmToken = await messaging().getToken();
    console.log('FCM token successfully retrieved');
    return fcmToken;
  } catch (error: any) {
    console.error('Failed to get FCM token:', error);

    // 디바이스 정보를 가져와서 더 정확한 에러 처리
    const isEmulator = await DeviceInfo.isEmulator().catch(() => false);
    let deviceBrand = 'Unknown';
    let deviceModel = 'Unknown';

    try {
      deviceBrand = DeviceInfo.getBrand();
      deviceModel = DeviceInfo.getModel();
    } catch (deviceInfoError) {
      console.warn('Failed to get device info:', deviceInfoError);
    }

    // Android SERVICE_NOT_AVAILABLE 에러 처리
    if (
      Platform.OS === 'android' &&
      error.message &&
      error.message.includes('SERVICE_NOT_AVAILABLE')
    ) {
      if (isEmulator) {
        console.warn(
          `FCM SERVICE_NOT_AVAILABLE on Android Emulator (${deviceBrand} ${deviceModel}): Google Play Services may not be available.`,
        );
        console.warn(
          'Tip: Use an emulator with Google Play Services or test on a real device.',
        );
      } else {
        console.warn(
          `FCM SERVICE_NOT_AVAILABLE on real device (${deviceBrand} ${deviceModel}): Check if Google Play Services is installed and updated.`,
        );
      }
      return null;
    }

    // APNS 토큰 관련 에러 처리 (iOS)
    if (
      error.code === 'messaging/unknown' &&
      error.message.includes('No APNS token')
    ) {
      if (isEmulator) {
        console.warn(
          `APNS token not available on iOS Simulator (${deviceBrand} ${deviceModel}): This is expected behavior.`,
        );
        console.warn(
          'Note: Push notifications do not work in iOS simulator. Test on a real device.',
        );
      } else {
        console.warn(
          `APNS token not available on real device (${deviceBrand} ${deviceModel}): Check APNS configuration.`,
        );
      }
      return null;
    }

    // 기타 에러 처리
    const deviceInfo = isEmulator
      ? `${deviceBrand} ${deviceModel} (Emulator)`
      : `${deviceBrand} ${deviceModel} (Real Device)`;
    console.error(`FCM Error on ${deviceInfo}:`);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.message) {
      console.error('Error message:', error.message);
    }
    return null;
  }
};

// 토큰 갱신 이벤트 리스너 설정
export const onTokenRefresh = (callback: (token: string) => void) => {
  return messaging().onTokenRefresh(token => {
    // console.log('New FCM Token:', token);
    callback(token);
  });
};
