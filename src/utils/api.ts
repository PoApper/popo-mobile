import axios from 'axios';
import CookieManager from '@react-native-cookies/cookies';
import EncryptedStorage from 'react-native-encrypted-storage';
import Config from 'react-native-config';
import {AUTH_TOKEN_KEY} from './storage-keys';
import {
  refreshAccessToken,
  getIsRefreshing,
  setIsRefreshing,
  addToFailedQueue,
  processQueue,
} from './refresh.utils';

export const ACCESS_TOKEN_EXPIRED_ERROR_MESSAGE = 'AccessTokenExpired';
// EventEmitter 타입 선언
declare global {
  var eventEmitter:
    | {
        emit: (event: string, ...args: any[]) => void;
      }
    | undefined;
}

const isProduction = Config.ENV === 'prod';

export const POPO_API_URL = isProduction
  ? 'https://api.popo.poapper.club'
  : 'https://api.popo-dev.poapper.club';

console.log('현재 ENV:', Config.ENV, 'URL:', POPO_API_URL);

// axios 인스턴스 생성
const api = axios.create({
  baseURL: POPO_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 설정
api.interceptors.request.use(
  async config => {
    try {
      // 쿠키 저장소에서 인증 토큰 가져오기
      const cookies = await CookieManager.get(POPO_API_URL);
      let authToken = cookies.Authentication?.value;

      // 쿠키가 없으면 EncryptedStorage에서 가져오기
      if (!authToken) {
        console.log('저장된 쿠키에 authToken 없음');
        const storedToken = await EncryptedStorage.getItem(AUTH_TOKEN_KEY);

        // 저장된 토큰이 있으면 쿠키 저장소에도 다시 설정
        if (storedToken) {
          authToken = storedToken;
          await CookieManager.set(POPO_API_URL, {
            name: 'Authentication',
            value: storedToken,
            path: '/',
            secure: true,
            httpOnly: true,
          });
        }
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

// TEMP: removed this and check
// // 응답 인터셉터 설정
// api.interceptors.response.use(
//   response => {
//     return response;
//   },
//   async error => {
//     const url = error.config.url;
//     if (error.response && error.response.status === 401) {
//       try {
//         // 인증 정보 초기화
//         if (await EncryptedStorage.getItem('auth_token')) {
//           await EncryptedStorage.removeItem('auth_token');
//         }
//         if (await EncryptedStorage.getItem('isAuthenticated')) {
//           await EncryptedStorage.removeItem('isAuthenticated');
//         }
//         if (await EncryptedStorage.getItem('user_info')) {
//           await EncryptedStorage.removeItem('user_info');
//         }
//         await CookieManager.clearAll();

//         if (error.response.data.detail) {
//           Alert.alert('로그인 필요', error.response.data.detail + url, [
//             {
//               text: '확인',
//               onPress: () => {
//                 // 로그인 스크린으로 이동
//                 navigationRef.current?.navigate('Login');
//               },
//             },
//           ]);
//         } else {
//           Alert.alert('로그인 필요', '로그인이 필요한 서비스입니다.' + url, [
//             {
//               text: '확인',
//               onPress: () => {
//                 // 로그인 스크린으로 이동
//                 navigationRef.current?.navigate('Login');
//               },
//             },
//           ]);
//         }
//       } catch (clearError) {
//         console.error('인증 정보 초기화 오류:', clearError);
//       }
//     }

//     return Promise.reject(error);
//   },
// );

// 응답 인터셉터: 401 AccessTokenExpired 처리 (popo API 자체)
api.interceptors.response.use(
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
          addToFailedQueue(resolve, reject, originalRequest, api);
        });
      }

      originalRequest._retry = true;
      setIsRefreshing(true);
      try {
        await refreshAccessToken();
        processQueue(null);
        return api(originalRequest);
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

export default api;
