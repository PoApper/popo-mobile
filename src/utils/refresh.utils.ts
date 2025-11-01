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
    // Authentication, Refresh 쿠키 파싱 및 저장
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      const authCookie = setCookie.find(cookie =>
        cookie.includes('Authentication='),
      );
      if (authCookie) {
        const tokenValue = authCookie
          .split('Authentication=')[1]
          .split(';')[0];
        await EncryptedStorage.setItem('auth_token', tokenValue);
        await CookieManager.set(POPO_API_URL, {
          name: 'Authentication',
          value: tokenValue,
          path: '/',
          secure: true,
          httpOnly: true,
        });
      }
      const refreshCookie = setCookie.find(cookie =>
        cookie.includes('Refresh='),
      );
      if (refreshCookie) {
        const tokenValue = refreshCookie
          .split('Refresh=')[1]
          .split(';')[0];
        await EncryptedStorage.setItem('refresh_token', tokenValue);
        await CookieManager.set(POPO_API_URL, {
          name: 'Refresh',
          value: tokenValue,
          path: '/',
          secure: true,
          httpOnly: true,
        });
      }
    } else {
      throw new Error('Authentication or Refresh token not found');
    }
    const ok = response.status === 200 || response.status === 201;
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


