import axios from 'axios';
import CookieManager from '@react-native-cookies/cookies';
import EncryptedStorage from 'react-native-encrypted-storage';
import { Alert } from 'react-native';
import { API_URL } from '@env';
import { navigationRef } from '../navigation/RootNavigation';

// EventEmitter 타입 선언
declare global {
  var eventEmitter: {
    emit: (event: string, ...args: any[]) => void;
  } | undefined;
}

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
        console.log("저장된 쿠키에 authToken 없음");
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
    if (error.response && error.response.status === 401) {
      try {
        // 인증 정보 초기화
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

        Alert.alert(
          "로그인 필요",
          "로그인이 필요한 서비스입니다.",
          [
            {
              text: "확인",
              onPress: () => {
                // 로그인 스크린으로 이동
                navigationRef.current?.navigate('Login');
              }
            }
          ]
        );
      } catch (clearError) {
        console.error('인증 정보 초기화 오류:', clearError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;