import axios from 'axios';
import CookieManager from '@react-native-cookies/cookies';
import EncryptedStorage from 'react-native-encrypted-storage';
import Config from 'react-native-config';
import {ACCESS_TOKEN_EXPIRED_ERROR_MESSAGE, COOKIE_DOMAIN} from './api';
import {
  refreshAccessToken,
  getIsRefreshing,
  setIsRefreshing,
  addToFailedQueue,
  processQueue,
} from './refresh.utils';
import {AUTH_TOKEN_KEY} from './storage-keys';

// EventEmitter 타입 선언
declare global {
  var eventEmitter:
    | {
        emit: (event: string, ...args: any[]) => void;
      }
    | undefined;
}

const isProduction = Config.ENV === 'prod';

export const PAXI_API_URL = isProduction
  ? 'https://api.paxi.popo.poapper.club'
  : 'https://api.paxi.popo-dev.poapper.club';

console.log('현재 Paxi ENV:', Config.ENV, 'URL:', PAXI_API_URL);

// axios 인스턴스 생성
const paxi_api = axios.create({
  baseURL: PAXI_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 설정
paxi_api.interceptors.request.use(
  async config => {
    try {
      // 쿠키 저장소에서 인증 토큰 가져오기
      const cookies = await CookieManager.get(PAXI_API_URL);
      let authToken = cookies.Authentication?.value;

      // 쿠키가 없으면 EncryptedStorage에서 가져오기
      if (!authToken) {
        console.log('저장된 쿠키에 authToken 없음');
        const storedToken = await EncryptedStorage.getItem(AUTH_TOKEN_KEY);

        // 저장된 토큰이 있으면 쿠키 저장소에도 다시 설정
        if (storedToken) {
          authToken = storedToken;
          await CookieManager.set(PAXI_API_URL, {
            name: 'Authentication',
            value: storedToken,
            domain: COOKIE_DOMAIN,
            path: '/',
            secure: true,
            httpOnly: true,
          });
        }
      }

      // 쿠키를 요청 헤더에 명시적으로 설정
      if (authToken) {
        config.headers.Cookie = `Authentication=${authToken}`;
      }

      return config;
    } catch (error) {
      console.error('API 요청 인터셉터 오류:', error);
      return config;
    }
  },
  error => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터: 401 AccessTokenExpired 처리 (paxi API → popo API refresh)
paxi_api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config || {};

    const status = error?.response?.status as number | undefined;
    const errorMessage = error?.response?.data?.error as string | undefined;

    if (
      status === 401 &&
      errorMessage === ACCESS_TOKEN_EXPIRED_ERROR_MESSAGE &&
      !originalRequest._retry
    ) {
      if (getIsRefreshing()) {
        return new Promise((resolve, reject) => {
          addToFailedQueue(resolve, reject, originalRequest, paxi_api);
        });
      }

      originalRequest._retry = true;
      setIsRefreshing(true);
      try {
        await refreshAccessToken();
        processQueue(null);
        // 갱신 전 토큰이 담긴 stale Cookie 제거 → interceptor가 새 토큰으로 재설정
        delete originalRequest.headers?.Cookie;
        return paxi_api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        setIsRefreshing(false);
      }
    }

    return Promise.reject(error);
  },
);

export default paxi_api;
