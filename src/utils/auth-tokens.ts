// get my auth token from cookie or encrypted storage

import EncryptedStorage from 'react-native-encrypted-storage';
import CookieManager from '@react-native-cookies/cookies';
import {POPO_API_URL} from './api';
import {AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY} from './storage-keys';
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
  const encryptedAuthToken = await EncryptedStorage.getItem(AUTH_TOKEN_KEY);
  return encryptedAuthToken;
};

// get my refresh token from cookie or encrypted storage
export const getRefreshToken = async () => {
  const refreshFromCookie = await getRefreshTokenFromCookie();
  const refreshFromEncryptedStorage =
    await getRefreshTokenFromEncryptedStorage();

  return {
    cookie: refreshFromCookie,
    encrypted_storage: refreshFromEncryptedStorage,
  };
};

export const getRefreshTokenFromCookie = async () => {
  const cookies = await CookieManager.get(POPO_API_URL);
  const refreshToken = cookies.Refresh?.value;
  return refreshToken;
};

export const getRefreshTokenFromEncryptedStorage = async () => {
  const encryptedRefreshToken = await EncryptedStorage.getItem(
    REFRESH_TOKEN_KEY,
  );
  return encryptedRefreshToken;
};
