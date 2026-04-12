import axios from 'axios';
import CookieManager from '@react-native-cookies/cookies';
import EncryptedStorage from 'react-native-encrypted-storage';
import {POPO_API_URL, COOKIE_DOMAIN} from './api';
import {extractTokenFromCookie} from './cookie';
import type {AxiosInstance} from 'axios';
import {navigationRef} from '../navigation/RootNavigation';
import {reset_auth} from './reset';
import {AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY} from './storage-keys';

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
      // 갱신 전 토큰이 담긴 stale Cookie 제거 → interceptor가 새 토큰으로 재설정
      originalRequest.headers?.delete?.('Cookie');
      resolve(requester(originalRequest));
    }
  });
  failedQueue = [];
};

export const refreshAccessToken = async () => {
  try {
    // /auth/refresh는 Authentication + Refresh 쿠키 둘 다 필요
    const currentAuthToken = await EncryptedStorage.getItem(AUTH_TOKEN_KEY);
    const currentRefreshToken = await EncryptedStorage.getItem(
      REFRESH_TOKEN_KEY,
    );
    const cookieHeader = [
      currentAuthToken ? `Authentication=${currentAuthToken}` : '',
      currentRefreshToken ? `Refresh=${currentRefreshToken}` : '',
    ]
      .filter(Boolean)
      .join('; ');

    // 인터셉터가 없는 plain axios 사용 — api 인스턴스를 쓰면
    // 응답 인터셉터가 401을 다시 refresh 시도하여 데드락 발생
    // NOTE: iOS에서는 withCredentials로 인해 쿠키 jar에서 자동 전송되고 수동 Cookie 헤더는
    // 무시됨. 쿠키 jar가 EncryptedStorage와 동기화되지 않는 극단적 경우 refresh 실패 가능.
    const response = await axios.post(
      `${POPO_API_URL}/auth/refresh`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader ? {Cookie: cookieHeader} : {}),
        },
        withCredentials: true,
      },
    );

    const ok = response.status === 200 || response.status === 201;
    if (!ok) {
      throw new Error('Refresh token failed');
    }
    // Authentication, Refresh 쿠키 파싱 및 저장
    const setCookie = response.headers['set-cookie'];
    if (!setCookie) {
      throw new Error('Set-Cookie not found');
    }

    const newAuthToken = extractTokenFromCookie(setCookie, true);
    if (newAuthToken) {
      await EncryptedStorage.setItem(AUTH_TOKEN_KEY, newAuthToken);
      await CookieManager.set(POPO_API_URL, {
        name: 'Authentication',
        value: newAuthToken,
        domain: COOKIE_DOMAIN,
        path: '/',
        secure: true,
        httpOnly: true,
      });
    }
    const newRefreshToken = extractTokenFromCookie(setCookie, false);
    if (newRefreshToken) {
      await EncryptedStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
      await CookieManager.set(POPO_API_URL, {
        name: 'Refresh',
        value: newRefreshToken,
        domain: COOKIE_DOMAIN,
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
