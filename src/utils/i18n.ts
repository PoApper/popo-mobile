import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import moment from 'moment';
import 'moment/locale/ko';
import {LocaleConfig} from 'react-native-calendars';
import EncryptedStorage from 'react-native-encrypted-storage';

import ko from '../locales/ko.json';
import en from '../locales/en.json';
import CalendarKoreanLocales from './calendar-locales';
import {LOCALE_KEY} from './storage-keys';
import {Locale, getDeviceLocale, isLocale, resolveLocale} from './locale';

LocaleConfig.locales.kr = CalendarKoreanLocales;

/** moment와 react-native-calendars는 전역 로케일이라 i18next와 함께 맞춘다. */
const syncDateLocale = (locale: Locale) => {
  moment.locale(locale);
  // xdate의 기본(영어) 로케일 키는 빈 문자열이다.
  LocaleConfig.defaultLocale = locale === 'ko' ? 'kr' : '';
};

const applyLocale = async (locale: Locale) => {
  syncDateLocale(locale);
  await i18next.changeLanguage(locale);
};

const initialLocale = getDeviceLocale();
i18next.use(initReactI18next).init({
  resources: {ko: {translation: ko}, en: {translation: en}},
  lng: initialLocale,
  fallbackLng: 'ko',
  interpolation: {escapeValue: false},
});
syncDateLocale(initialLocale);

export const getCurrentLocale = (): Locale =>
  resolveLocale(i18next.language, initialLocale);

/** 앱 내 스위처에서 고른 값. null이면 기기 언어를 따르는 중이다. */
export const getLocalePreference = async (): Promise<Locale | null> => {
  const stored = await EncryptedStorage.getItem(LOCALE_KEY).catch(() => null);
  return isLocale(stored) ? stored : null;
};

/** 앱 시작 시 저장된 선택을 반영한다. 첫 렌더 전에 await해야 언어가 깜빡이지 않는다. */
export const loadStoredLocale = async () => {
  await applyLocale(
    resolveLocale(await getLocalePreference(), getDeviceLocale()),
  );
};

/** null이면 저장값을 지우고 기기 언어를 따른다. */
export const setLocalePreference = async (preference: Locale | null) => {
  if (preference) {
    await EncryptedStorage.setItem(LOCALE_KEY, preference);
  } else {
    await EncryptedStorage.removeItem(LOCALE_KEY);
  }
  await applyLocale(resolveLocale(preference, getDeviceLocale()));
};

export default i18next;
