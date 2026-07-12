/**
 * i18n entegrasyon hook'u — settings store'undaki dili i18next ile senkronize tutar.
 * Root layout'ta bir kez çağrılması yeterlidir.
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { setI18nLanguage } from '@/i18n';
import { useSettingsStore } from '@/stores/useSettingsStore';

export const useI18nSync = (): void => {
  const language = useSettingsStore((s) => s.language);
  useEffect(() => {
    setI18nLanguage(language);
  }, [language]);
};

export { useTranslation };
