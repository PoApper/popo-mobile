import CookieManager from '@react-native-cookies/cookies';
import EncryptedStorage from 'react-native-encrypted-storage';
import api, {POPO_API_URL} from './api';
import {extractTokenFromCookie} from './cookie';
import type {AxiosInstance} from 'axios';
import {navigationRef} from '../navigation/RootNavigation';
import {reset_auth} from './reset';
import {AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, IS_AUTHENTICATED_KEY, USER_INFO_KEY} from './storage-keys';

let isRefreshing = false;

type FailedItem = {
  resolve: (value?: any) => void;
  reject: (error: any) => void;
  originalRequest: any;
  requester: AxiosInstance;
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
  requester: AxiosInstance,
) => {
  failedQueue.push({resolve, reject, originalRequest, requester});
};

export const processQueue = (error: any) => {
  failedQueue.forEach(({resolve, reject, originalRequest, requester}) => {
    if (error) {
      reject(error);
    } else {
      resolve(requester(originalRequest));
    }
  });
  failedQueue = [];
};

export const refreshAccessToken = async () => {
  try {
    const response = await api.post('/auth/refresh', {});

    const ok = response.status === 200 || response.status === 201;
    if (!ok) {
      throw new Error('Refresh token failed');
    }
    // Authentication, Refresh 쿠키 파싱 및 저장
    const setCookie = response.headers['set-cookie'];
    if (!setCookie) {
      throw new Error('Set-Cookie not found');
    }

    const authToken = extractTokenFromCookie(setCookie, true);
    if (authToken) {
      await EncryptedStorage.setItem(AUTH_TOKEN_KEY, authToken);
      await CookieManager.set(POPO_API_URL, {
        name: 'Authentication',
        value: authToken,
        path: '/',
        secure: true,
        httpOnly: true,
      });
    }
    const refreshToken = extractTokenFromCookie(setCookie, false);
    if (refreshToken) {
      await EncryptedStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      await CookieManager.set(POPO_API_URL, {
        name: 'Refresh',
        value: refreshToken,
        path: '/',
        secure: true,
        httpOnly: true,
      });
    }

    return true;
  } catch (error) {
    // 인증 정보 초기화 및 로그인 화면으로 이동
    try {
      await reset_auth();
    } catch {}

    if (navigationRef.isReady()) {
      navigationRef.navigate('Login');
    }
    throw error;
  }
};
