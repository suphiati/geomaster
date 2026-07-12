/**
 * 6 quiz modunun statik tanımları.
 * UI seçim kartlarında kullanılır.
 */

import type { MaterialCommunityIcons } from '@expo/vector-icons';

import type { QuizMode } from '@/types';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export interface QuizModeMeta {
  mode: QuizMode;
  /** /quiz/* altında dosya adı (route segment). */
  route: string;
  title: string;
  description: string;
  icon: IconName;
  available: boolean;
  /** UI vurgu rengi (kategori bazlı). */
  accentKey: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning';
}

export const QUIZ_MODES: readonly QuizModeMeta[] = [
  {
    mode: 'classic',
    route: 'classic',
    title: 'Klasik',
    description: '4 şıklı, can sistemli, klasik quiz deneyimi.',
    icon: 'help-circle-outline',
    available: true,
    accentKey: 'primary',
  },
  {
    mode: 'flag_match',
    route: 'flag-match',
    title: 'Bayrak Eşleştirme',
    description: 'Hızlı tempolu bayrak-ülke eşleştirme.',
    icon: 'flag-outline',
    available: true,
    accentKey: 'secondary',
  },
  {
    mode: 'neighbor_chain',
    route: 'neighbor-chain',
    title: 'Komşu Zinciri',
    description: 'Komşu ülkelerden zincir kurarak hedefe ulaş.',
    icon: 'graph-outline',
    available: true,
    accentKey: 'info',
  },
  {
    mode: 'speed_round',
    route: 'speed-round',
    title: 'Hız Turu',
    description: '60 saniyede en çok doğru cevabı ver.',
    icon: 'timer-sand',
    available: true,
    accentKey: 'warning',
  },
  {
    mode: 'true_false',
    route: 'true-false',
    title: 'Doğru / Yanlış',
    description: 'Bilgi cümlesi doğru mu, yanlış mı?',
    icon: 'check-circle-outline',
    available: true,
    accentKey: 'success',
  },
  {
    mode: 'daily_challenge',
    route: 'daily',
    title: 'Günlük Challenge',
    description: 'Her gün yeni ülke. 6 ipucu ile bul!',
    icon: 'calendar-star',
    available: true,
    accentKey: 'accent',
  },
];
