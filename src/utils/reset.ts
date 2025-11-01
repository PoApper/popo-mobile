import CookieManager from '@react-native-cookies/cookies';
import EncryptedStorage from 'react-native-encrypted-storage';

export async function reset_auth() {
  try {
    if (await EncryptedStorage.getItem('auth_token')) {
      await EncryptedStorage.removeItem('auth_token');
    }
    if (await EncryptedStorage.getItem('refresh_token')) {
      await EncryptedStorage.removeItem('refresh_token');
    }
    if (await EncryptedStorage.getItem('isAuthenticated')) {
      await EncryptedStorage.removeItem('isAuthenticated');
    }
    if (await EncryptedStorage.getItem('user_info')) {
      await EncryptedStorage.removeItem('user_info');
    }
    await CookieManager.clearAll();
  } catch (error) {
    console.error('인증 정보 초기화 오류:', error);
  }
}
