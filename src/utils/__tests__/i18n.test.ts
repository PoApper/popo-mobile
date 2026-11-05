import moment from 'moment';
import {LocaleConfig} from 'react-native-calendars';
import EncryptedStorage from 'react-native-encrypted-storage';
import i18n, {
  getCurrentLocale,
  getLocalePreference,
  loadStoredLocale,
  setLocalePreference,
} from '../i18n';
import {LOCALE_KEY} from '../storage-keys';

const mockDeviceLocale = (locale: string) =>
  jest
    .spyOn(Intl, 'DateTimeFormat')
    .mockReturnValue({resolvedOptions: () => ({locale})} as any);

beforeEach(async () => {
  await EncryptedStorage.clear();
  mockDeviceLocale('ko-KR');
});
afterEach(() => jest.restoreAllMocks());

it('선택을 저장하고 i18next·moment·캘린더 로케일을 함께 바꾼다', async () => {
  await setLocalePreference('en');

  expect(await getLocalePreference()).toBe('en');
  expect(getCurrentLocale()).toBe('en');
  expect(i18n.t('language.title')).toBe('Language');
  expect(moment.locale()).toBe('en');
  expect(LocaleConfig.defaultLocale).toBe('');
});

it('null이면 저장값을 지우고 기기 언어로 돌아간다', async () => {
  await setLocalePreference('en');
  await setLocalePreference(null);

  expect(await EncryptedStorage.getItem(LOCALE_KEY)).toBeNull();
  expect(getCurrentLocale()).toBe('ko');
  expect(i18n.t('language.title')).toBe('언어');
  expect(LocaleConfig.defaultLocale).toBe('kr');
});

it('앱 시작 시 저장된 선택을 반영한다', async () => {
  await EncryptedStorage.setItem(LOCALE_KEY, 'en');
  await loadStoredLocale();
  expect(getCurrentLocale()).toBe('en');
});
