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
