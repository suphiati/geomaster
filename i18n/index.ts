/**
 * i18next yapılandırması.
 * Settings store'undan dil seçilir; başlangıçta cihaz dili kullanılır.
 */

import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import tr from './tr.json';

import type { Locale } from '@/types';

const detectLocale = (): Locale => {
  const code = getLocales()[0]?.languageCode;
  return code === 'tr' ? 'tr' : 'en';
};

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
    },
    lng: detectLocale(),
    fallbackLng: 'tr',
    interpolation: { escapeValue: false },
    returnNull: false,
    compatibilityJSON: 'v4',
  });
}

/** Settings değiştiğinde i18n dilini günceller. */
export const setI18nLanguage = (lang: Locale): void => {
  if (i18n.language !== lang) {
    void i18n.changeLanguage(lang);
  }
};

export { default as i18n } from 'i18next';
