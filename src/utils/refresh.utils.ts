import CookieManager from '@react-native-cookies/cookies';
import EncryptedStorage from 'react-native-encrypted-storage';
import api, {POPO_API_URL} from './api';
import {navigationRef} from '../navigation/RootNavigation';

let isRefreshing = false;

type FailedItem = {
  resolve: (value?: any) => void;
  reject: (error: any) => void;
  originalRequest: any;
};

let failedQueue: FailedItem[] = [];

export const getIsRefreshing = () => isRefreshing;
export const setIsRefreshing = (value: boolean) => {
  isRefreshing = value;
};

export const addToFailedQueue = (
  resolve: (value?: any) => void,
  reject: (error: any) => void,
  originalRequest: any,
) => {
  failedQueue.push({resolve, reject, originalRequest});
};

export const processQueue = (error: any) => {
  failedQueue.forEach(({resolve, reject, originalRequest}) => {
    if (error) {
      reject(error);
    } else {
      resolve(api(originalRequest));
    }
  });
  failedQueue = [];
};

export const refreshAccessToken = async () => {
  try {
    const response = await api.post('/auth/refresh', {});
    const ok = response.status === 200 || response.status === 201;

    // 최신 쿠키를 EncryptedStorage에도 반영 (앱 재시작 대비)
    try {
      const cookies = await CookieManager.get(POPO_API_URL);
      const token = cookies.Authentication?.value;
      if (token) {
        await EncryptedStorage.setItem('auth_token', token);
      }
    } catch {}

    if (!ok) {
      throw new Error('Refresh token failed');
    }
    return true;
  } catch (error) {
    // 인증 정보 초기화 및 로그인 화면으로 이동
    try {
      if (await EncryptedStorage.getItem('auth_token')) {
        await EncryptedStorage.removeItem('auth_token');
      }
      if (await EncryptedStorage.getItem('isAuthenticated')) {
        await EncryptedStorage.removeItem('isAuthenticated');
      }
      if (await EncryptedStorage.getItem('user_info')) {
        await EncryptedStorage.removeItem('user_info');
      }
      await CookieManager.clearAll();
    } catch {}

    if (navigationRef.isReady()) {
      navigationRef.navigate('Login');
    }
    throw error;
  }
};


