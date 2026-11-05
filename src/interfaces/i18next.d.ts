import 'i18next';
import ko from '../locales/ko.json';

// t('...') 키를 ko.json 기준으로 타입 검사한다.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {translation: typeof ko};
  }
}
