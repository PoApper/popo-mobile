import {Platform, Settings} from 'react-native';

export const SUPPORTED_LOCALES = ['ko', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const isLocale = (value: unknown): value is Locale =>
  SUPPORTED_LOCALES.includes(value as Locale);

/**
 * iOS의 Intl 기본 로케일은 앱이 선언한 로컬라이제이션(en뿐)과 기기 언어의
 * 교집합이라 항상 en이 나온다. 그래서 iOS는 기기 언어 목록(AppleLanguages)을
 * 직접 읽는다. Android의 Intl은 시스템 언어를 그대로 반영한다.
 */
const getDeviceLanguageTag = (): string => {
  if (Platform.OS === 'ios') {
    try {
      const languages = Settings.get('AppleLanguages');
      if (Array.isArray(languages) && typeof languages[0] === 'string') {
        return languages[0];
      }
    } catch {
      // 네이티브 모듈이 없으면(테스트 등) Intl로 폴백
    }
  }
  return Intl.DateTimeFormat().resolvedOptions().locale;
};

/** 기기 언어를 지원 로케일로 사상한다. 한국어 외 모든 언어는 영어로 본다. */
export const getDeviceLocale = (): Locale =>
  getDeviceLanguageTag().startsWith('ko') ? 'ko' : 'en';

/** 저장된 사용자 선택이 유효하면 그것을, 아니면 기기 언어를 쓴다. */
export const resolveLocale = (stored: unknown, device: Locale): Locale =>
  isLocale(stored) ? stored : device;

/**
 * 서버의 영문 필드(`${field}En`)가 비어 있으면 원문으로 폴백한다.
 * popo-public-web `lib/locale.ts`와 같은 규칙.
 */
export function getLocalizedField<T extends object>(
  resource: T,
  field: keyof T & string,
  locale: Locale,
): string {
  const translated = (resource as Record<string, unknown>)[`${field}En`];
  if (locale === 'en' && typeof translated === 'string' && translated.trim()) {
    return translated.trim();
  }
  const original = resource[field];
  return typeof original === 'string' ? original : '';
}
