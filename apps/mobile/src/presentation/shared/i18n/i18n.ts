import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { en } from '@/src/locales/en';
import { zh } from '@/src/locales/zh';

const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'en';
const lng = deviceLocale.startsWith('zh') ? 'zh' : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
