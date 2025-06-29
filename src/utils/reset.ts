import CookieManager from '@react-native-cookies/cookies';
import EncryptedStorage from 'react-native-encrypted-storage';

export async function reset_auth() {
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
}
