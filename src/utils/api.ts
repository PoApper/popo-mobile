import axios from 'axios';
import CookieManager from '@react-native-cookies/cookies';
import EncryptedStorage from 'react-native-encrypted-storage';
import {Platform, NativeModules} from 'react-native';

// EventEmitter 타입 선언
declare global {
  var eventEmitter:
    | {
        emit: (event: string, ...args: any[]) => void;
      }
    | undefined;
}

// 환경에 따른 API URL 설정
const getApiEnv = () => {
  if (Platform.OS === 'ios') {
    const apiEnv = NativeModules.SourceCode?.constantsToExport?.API_ENV || 'development';
    console.log('iOS API_ENV:', apiEnv);
    return apiEnv;
  } else {
    // Android는 build.gradle에서 설정
    console.log('Android NativeModules.BuildConfig:', NativeModules.BuildConfig);
    console.log('Android API_ENV:', NativeModules.BuildConfig?.API_ENV);
    
    // BuildConfig에서 직접 접근 시도
    const buildConfig = NativeModules.BuildConfig;
    let apiEnv = 'development';
    
    if (buildConfig && buildConfig.API_ENV) {
      apiEnv = buildConfig.API_ENV;
    } else {
      // 대안: __DEV__ 플래그 사용
      apiEnv = __DEV__ ? 'development' : 'production';
      console.log('BuildConfig API_ENV not found, using __DEV__:', apiEnv);
    }
    
    console.log('Android 최종 API_ENV:', apiEnv);
    return apiEnv;
  }
};

const API_ENV = getApiEnv();
const isProduction = API_ENV === 'production';

export const POPO_API_URL = isProduction
  ? 'https://api.popo.poapper.club'
  : 'https://api.popo-dev.poapper.club';

console.log('현재 API 환경:', API_ENV, 'URL:', POPO_API_URL);

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
        const storedToken = await EncryptedStorage.getItem('auth_token');

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

export default api;
