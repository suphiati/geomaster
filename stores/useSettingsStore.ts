/**
 * Kullanıcı tercihleri (dil, tema, ses, haptics).
 * AsyncStorage ile kalıcılaştırılır — uygulama yeniden başlatıldığında tercihler korunur.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ThemeMode } from '@/constants/theme';
import type { Locale } from '@/types';

interface SettingsState {
  language: Locale;
  themeMode: ThemeMode | 'system';
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  hasCompletedOnboarding: boolean;
}

interface SettingsActions {
  setLanguage: (lang: Locale) => void;
  setThemeMode: (mode: ThemeMode | 'system') => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

const INITIAL_STATE: SettingsState = {
  language: 'tr',
  themeMode: 'system',
  soundEnabled: true,
  hapticsEnabled: true,
  hasCompletedOnboarding: false,
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,
      setLanguage: (language) => set({ language }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'geomaster-settings',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
