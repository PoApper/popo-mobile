import axios from 'axios';
import CookieManager from '@react-native-cookies/cookies';
import EncryptedStorage from 'react-native-encrypted-storage';
import { API_URL } from '@env';

// API 기본 URL
const POPO_API_URL = API_URL || 'https://api.popo-dev.poapper.club';

console.log('현재 API URL:', POPO_API_URL);

// axios 인스턴스 생성
const api = axios.create({
  baseURL: POPO_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 설정
api.interceptors.request.use(
  async (config) => {
    try {
      // 쿠키 저장소에서 인증 토큰 가져오기
      const cookies = await CookieManager.get(POPO_API_URL);
      let authToken = cookies.Authentication?.value;

      // 쿠키가 없으면 EncryptedStorage에서 가져오기
      if (!authToken) {
        const storedToken = await EncryptedStorage.getItem('auth_token');

        // 저장된 토큰이 있으면 쿠키 저장소에도 다시 설정
        if (storedToken) {
          authToken = storedToken;
          await CookieManager.set(
            POPO_API_URL,
            {
              name: 'Authentication',
              value: storedToken,
              path: '/',
              secure: true,
              httpOnly: true
            }
          );
        }
      }

      // 인증 토큰이 있으면 요청 헤더에 쿠키 추가
      // if (authToken && config.headers) {
      //   console.error("set cookie errr!");
      //   console.log("authToken", authToken);
      //   config.headers.Cookie = `Authentication=${authToken};`;
      // }

      return config;
    } catch (error) {
      console.error('API 요청 인터셉터 오류:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // 401 인증 오류 처리
    // if (error.response && error.response.status === 401) {
    //   try {
    //     // 인증 정보 초기화
    //     await EncryptedStorage.removeItem('auth_token');
    //     await EncryptedStorage.removeItem('isAuthenticated');
    //     await EncryptedStorage.removeItem('user_info');
    //     await CookieManager.clearAll();

    //     // 여기서 로그인 화면으로 이동하는 로직은 컴포넌트에서 처리해야 함
    //   } catch (clearError) {
    //     console.error('인증 정보 초기화 오류:', clearError);
    //   }
    // }

    return Promise.reject(error);
  }
);

export default api;