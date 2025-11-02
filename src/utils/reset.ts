import CookieManager from '@react-native-cookies/cookies';
import EncryptedStorage from 'react-native-encrypted-storage';
import {
  AUTH_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  IS_AUTHENTICATED_KEY,
  USER_INFO_KEY,
} from './storage-keys';

export async function reset_auth() {
  try {
    if (await EncryptedStorage.getItem(AUTH_TOKEN_KEY)) {
      await EncryptedStorage.removeItem(AUTH_TOKEN_KEY);
    }
    if (await EncryptedStorage.getItem(REFRESH_TOKEN_KEY)) {
      await EncryptedStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    if (await EncryptedStorage.getItem(IS_AUTHENTICATED_KEY)) {
      await EncryptedStorage.removeItem(IS_AUTHENTICATED_KEY);
    }
    if (await EncryptedStorage.getItem(USER_INFO_KEY)) {
      await EncryptedStorage.removeItem(USER_INFO_KEY);
    }
    await CookieManager.clearAll();
  } catch (error) {
    console.error('인증 정보 초기화 오류:', error);
  }
}
