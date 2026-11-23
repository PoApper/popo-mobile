import messaging from '@react-native-firebase/messaging';

import paxi_api from './paxi_api';
import {getFCMToken} from './firebase';
import {getCurrentLocale} from './i18n';

/**
 * FCM 토큰과 현재 언어를 Paxi 서버에 등록한다.
 * 서버는 locale로 푸시 문구 언어를 고르므로 언어를 바꿀 때도 다시 호출한다.
 * token을 주면(토큰 갱신 이벤트) 새로 발급받지 않고 그 토큰을 등록한다.
 */
export const registerPushKey = async (token?: string) => {
  const key = token ?? (await getFCMToken());
  if (!key) {
    return;
  }
  await paxi_api.post('/push/key/', {key, locale: getCurrentLocale()});
};

// 로그아웃 시 이 기기의 FCM 토큰을 서버에서 삭제해 다음 사용자에게 이전 계정 푸시가 가지 않게 한다.
// 인증 쿠키가 필요하므로 토큰을 지우기 전에 호출해야 하며, 실패해도 로그아웃은 막지 않는다.
export const unregisterPushKey = async () => {
  try {
    const key = await messaging().getToken();
    await paxi_api.delete('/push/key', {params: {key}});
  } catch (error) {
    console.error('[FCM] unregister failed:', error);
  }
};
