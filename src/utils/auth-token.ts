// get my auth token from cookie or encrypted storage

import EncryptedStorage from 'react-native-encrypted-storage';
import CookieManager from '@react-native-cookies/cookies';
import {POPO_API_URL} from './api';
import {getFCMToken} from './firebase';

export const getAuthToken = async () => {
  const authTokenFromCookie = await getAuthTokenFromCookie();
  const authTokenFromEncryptedStorage =
    await getAuthTokenFromEncryptedStorage();

  const fcmToken = await getFCMToken();

  return {
    cookie: authTokenFromCookie,
    encrypted_storage: authTokenFromEncryptedStorage,
    fcm_token: fcmToken,
  };
};

export const getAuthTokenFromCookie = async () => {
  const cookies = await CookieManager.get(POPO_API_URL);
  const authToken = cookies.Authentication?.value;
  return authToken;
};

export const getAuthTokenFromEncryptedStorage = async () => {
  const encryptedAuthToken = await EncryptedStorage.getItem('authToken');
  return encryptedAuthToken;
};
