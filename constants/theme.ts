/**
 * GeoMaster tema sistemi.
 * Renk paleti, spacing, border radius, typography ve shadow tanımlarını içerir.
 * Hem koyu hem açık tema desteği sağlar.
 */

import { Platform } from 'react-native';

export type ThemeMode = 'dark' | 'light';

export interface ThemePalette {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfacePressed: string;
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  border: string;
  borderLight: string;
  overlay: string;
  continents: {
    Afrika: string;
    Asya: string;
    Avrupa: string;
    'Kuzey Amerika': string;
    'Güney Amerika': string;
    Okyanusya: string;
  };
  difficulty: {
    easy: string;
    medium: string;
    hard: string;
    expert: string;
  };
  rarity: {
    common: string;
    rare: string;
    epic: string;
    legendary: string;
  };
}

const PALETTE_DARK: ThemePalette = {
  background: '#0F1117',
  surface: '#1A1D27',
  surfaceElevated: '#232736',
  surfacePressed: '#2D3143',
  primary: '#4ECDC4',
  primaryDark: '#3BA89F',
  secondary: '#FF6B6B',
  accent: '#FFE66D',
  success: '#2ED573',
  error: '#FF4757',
  warning: '#FFA502',
  info: '#667EEA',
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A5B8',
    muted: '#636882',
    inverse: '#0F1117',
  },
  border: '#2A2E3D',
  borderLight: '#363B50',
  overlay: 'rgba(0, 0, 0, 0.6)',
  continents: {
    Afrika: '#FF6B6B',
    Asya: '#4ECDC4',
    Avrupa: '#667EEA',
    'Kuzey Amerika': '#F093FB',
    'Güney Amerika': '#4FACFE',
    Okyanusya: '#43E97B',
  },
  difficulty: {
    easy: '#2ED573',
    medium: '#FFA502',
    hard: '#FF6B6B',
    expert: '#9B59B6',
  },
  rarity: {
    common: '#8B8B8B',
    rare: '#4ECDC4',
    epic: '#9B59B6',
    legendary: '#FFE66D',
  },
};

const PALETTE_LIGHT: ThemePalette = {
  background: '#F5F6FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfacePressed: '#EEEEF2',
  primary: '#3BA89F',
  primaryDark: '#2D8A82',
  secondary: '#E55555',
  accent: '#D4A700',
  success: '#27AE60',
  error: '#E74C3C',
  warning: '#F39C12',
  info: '#5468D4',
  text: {
    primary: '#1A1D27',
    secondary: '#636882',
    muted: '#A0A5B8',
    inverse: '#FFFFFF',
  },
  border: '#E0E2EC',
  borderLight: '#EEEEF2',
  overlay: 'rgba(0, 0, 0, 0.4)',
  continents: {
    Afrika: '#E55555',
    Asya: '#3BA89F',
    Avrupa: '#5468D4',
    'Kuzey Amerika': '#D070E8',
    'Güney Amerika': '#3B8FE4',
    Okyanusya: '#2ECC71',
  },
  difficulty: {
    easy: '#27AE60',
    medium: '#F39C12',
    hard: '#E74C3C',
    expert: '#8E44AD',
  },
  rarity: {
    common: '#95A5A6',
    rare: '#3BA89F',
    epic: '#8E44AD',
    legendary: '#D4A700',
  },
};

export const COLORS: Record<ThemeMode, ThemePalette> = {
  dark: PALETTE_DARK,
  light: PALETTE_LIGHT,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

const FONT_FAMILY = {
  display: 'Outfit-Bold',
  displayMedium: 'Outfit-SemiBold',
  body: 'Nunito-Regular',
  bodyBold: 'Nunito-Bold',
  mono: 'JetBrainsMono-Regular',
} as const;

export const TYPOGRAPHY = {
  displayLarge: { fontFamily: FONT_FAMILY.display, fontSize: 40, lineHeight: 48 },
  displayMedium: { fontFamily: FONT_FAMILY.display, fontSize: 32, lineHeight: 40 },
  h1: { fontFamily: FONT_FAMILY.display, fontSize: 28, lineHeight: 36 },
  h2: { fontFamily: FONT_FAMILY.displayMedium, fontSize: 24, lineHeight: 32 },
  h3: { fontFamily: FONT_FAMILY.displayMedium, fontSize: 20, lineHeight: 28 },
  bodyLarge: { fontFamily: FONT_FAMILY.body, fontSize: 18, lineHeight: 28 },
  body: { fontFamily: FONT_FAMILY.body, fontSize: 16, lineHeight: 24 },
  bodyBold: { fontFamily: FONT_FAMILY.bodyBold, fontSize: 16, lineHeight: 24 },
  bodySm: { fontFamily: FONT_FAMILY.body, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: FONT_FAMILY.body, fontSize: 12, lineHeight: 16 },
  captionBold: { fontFamily: FONT_FAMILY.bodyBold, fontSize: 12, lineHeight: 16 },
  mono: { fontFamily: FONT_FAMILY.mono, fontSize: 14, lineHeight: 20 },
  monoLarge: { fontFamily: FONT_FAMILY.mono, fontSize: 20, lineHeight: 28 },
} as const;

const SHADOW_BASE = {
  shadowColor: '#000',
} as const;

export const SHADOWS = {
  sm: {
    ...SHADOW_BASE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    ...SHADOW_BASE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    ...SHADOW_BASE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

/** Animasyon süresi sabitleri (ms). */
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 400,
  flash: 300,
} as const;

export const isIOS = Platform.OS === 'ios';

/**
 * Tema moduna göre palet döndürür.
 * @param mode 'dark' veya 'light'
 */
export const getPalette = (mode: ThemeMode): ThemePalette => COLORS[mode];
