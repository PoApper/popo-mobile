import {Platform, Settings} from 'react-native';
import {getDeviceLocale, getLocalizedField, resolveLocale} from '../locale';

const mockDeviceLocale = (locale: string) =>
  jest
    .spyOn(Intl, 'DateTimeFormat')
    .mockReturnValue({resolvedOptions: () => ({locale})} as any);

afterEach(() => jest.restoreAllMocks());

describe('getDeviceLocale', () => {
  it('한국어 기기는 ko', () => {
    mockDeviceLocale('ko-KR');
    expect(getDeviceLocale()).toBe('ko');
  });

  it('한국어 외 모든 언어는 en', () => {
    mockDeviceLocale('ja-JP');
    expect(getDeviceLocale()).toBe('en');
  });

  it('iOS는 Intl이 아니라 기기 언어 목록(AppleLanguages)을 따른다', () => {
    Platform.OS = 'ios';
    mockDeviceLocale('en-US');
    jest.spyOn(Settings, 'get').mockReturnValue(['ko-KR', 'en-US']);
    expect(getDeviceLocale()).toBe('ko');
  });

  it('Android는 Intl을 따른다', () => {
    Platform.OS = 'android';
    mockDeviceLocale('ko-KR');
    expect(getDeviceLocale()).toBe('ko');
  });
});

describe('resolveLocale', () => {
  it('저장된 선택이 우선한다', () => {
    expect(resolveLocale('en', 'ko')).toBe('en');
  });

  it('저장값이 없거나 잘못되면 기기 언어를 쓴다', () => {
    expect(resolveLocale(null, 'ko')).toBe('ko');
    expect(resolveLocale('fr', 'en')).toBe('en');
  });
});

describe('getLocalizedField', () => {
  const place = {
    name: '아틀라스홀',
    nameEn: ' Atlas Hall ',
    location: 'RC 1층',
  };

  it('en이면 영문 필드를 trim해서 쓴다', () => {
    expect(getLocalizedField(place, 'name', 'en')).toBe('Atlas Hall');
  });

  it('영문 필드가 비어 있으면 원문으로 폴백한다', () => {
    expect(getLocalizedField(place, 'location', 'en')).toBe('RC 1층');
    expect(getLocalizedField({name: 'x', nameEn: '  '}, 'name', 'en')).toBe(
      'x',
    );
  });

  it('ko면 항상 원문', () => {
    expect(getLocalizedField(place, 'name', 'ko')).toBe('아틀라스홀');
  });
});
