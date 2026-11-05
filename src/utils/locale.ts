export const SUPPORTED_LOCALES = ['ko', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const isLocale = (value: unknown): value is Locale =>
  SUPPORTED_LOCALES.includes(value as Locale);

/** 기기 언어를 지원 로케일로 사상한다. 한국어 외 모든 언어는 영어로 본다. */
export const getDeviceLocale = (): Locale =>
  Intl.DateTimeFormat().resolvedOptions().locale.startsWith('ko') ? 'ko' : 'en';

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
