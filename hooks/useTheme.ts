/**
 * Aktif tema palet ve modunu döndürür.
 * Settings store'undaki tercih önceliklidir; 'system' ise cihaz teması kullanılır.
 */

import { useColorScheme } from 'react-native';

import { COLORS, getPalette, type ThemeMode, type ThemePalette } from '@/constants/theme';
import { useSettingsStore } from '@/stores/useSettingsStore';

export interface UseThemeResult {
  mode: ThemeMode;
  palette: ThemePalette;
  isDark: boolean;
}

export const useTheme = (): UseThemeResult => {
  const systemScheme = useColorScheme();
  const preference = useSettingsStore((s) => s.themeMode);

  const mode: ThemeMode = (() => {
    if (preference === 'dark' || preference === 'light') return preference;
    return systemScheme === 'light' ? 'light' : 'dark';
  })();

  return {
    mode,
    palette: getPalette(mode),
    isDark: mode === 'dark',
  };
};

export { COLORS };
