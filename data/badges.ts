/**
 * Tüm rozet tanımları.
 * Spec'teki 50+ rozeti karşılayacak şekilde kategorilere ayrılmıştır.
 */

import type { Badge } from '@/types';

const make = (b: Badge): Badge => b;

/** Kıta rozetleri (7) */
const CONTINENT_BADGES: readonly Badge[] = [
  make({
    id: 'cont-africa',
    name: { tr: 'Afrika Kaşifi', en: 'Africa Explorer' },
    description: { tr: 'Afrika kıtasında 50 doğru cevap', en: '50 correct answers in Africa' },
    icon: '🌍',
    category: 'continent',
    rarity: 'rare',
    condition: { type: 'continent_mastery', continent: 'Afrika', minCorrect: 50 },
    xpReward: 100,
  }),
  make({
    id: 'cont-asia',
    name: { tr: 'Asya Uzmanı', en: 'Asia Master' },
    description: { tr: 'Asya kıtasında 50 doğru cevap', en: '50 correct answers in Asia' },
    icon: '🌏',
    category: 'continent',
    rarity: 'rare',
    condition: { type: 'continent_mastery', continent: 'Asya', minCorrect: 50 },
    xpReward: 100,
  }),
  make({
    id: 'cont-europe',
    name: { tr: 'Avrupa Bilgini', en: 'Europe Scholar' },
    description: { tr: 'Avrupa kıtasında 50 doğru cevap', en: '50 correct answers in Europe' },
    icon: '🏰',
    category: 'continent',
    rarity: 'rare',
    condition: { type: 'continent_mastery', continent: 'Avrupa', minCorrect: 50 },
    xpReward: 100,
  }),
  make({
    id: 'cont-na',
    name: { tr: 'Amerika Kıtası', en: 'North America' },
    description: { tr: 'K. Amerika\'da 30 doğru cevap', en: '30 correct answers in North America' },
    icon: '🗽',
    category: 'continent',
    rarity: 'rare',
    condition: { type: 'continent_mastery', continent: 'Kuzey Amerika', minCorrect: 30 },
    xpReward: 100,
  }),
  make({
    id: 'cont-sa',
    name: { tr: 'G. Amerika Tutkunu', en: 'South America Lover' },
    description: { tr: 'G. Amerika\'da 30 doğru cevap', en: '30 correct answers in South America' },
    icon: '🌎',
    category: 'continent',
    rarity: 'rare',
    condition: { type: 'continent_mastery', continent: 'Güney Amerika', minCorrect: 30 },
    xpReward: 100,
  }),
  make({
    id: 'cont-oceania',
    name: { tr: 'Okyanusya Dalgası', en: 'Oceania Wave' },
    description: { tr: 'Okyanusya\'da 20 doğru cevap', en: '20 correct answers in Oceania' },
    icon: '🌊',
    category: 'continent',
    rarity: 'rare',
    condition: { type: 'continent_mastery', continent: 'Okyanusya', minCorrect: 20 },
    xpReward: 100,
  }),
];

/** Streak rozetleri (4 — günlük) */
const STREAK_BADGES: readonly Badge[] = [
  make({
    id: 'streak-3',
    name: { tr: '3 Gün Ateşi', en: '3-Day Fire' },
    description: { tr: '3 gün üst üste oyna', en: 'Play 3 days in a row' },
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    condition: { type: 'streak_days', days: 3 },
    xpReward: 30,
  }),
  make({
    id: 'streak-7',
    name: { tr: '7 Gün Alevi', en: '7-Day Flame' },
    description: { tr: '7 gün üst üste oyna', en: 'Play 7 days in a row' },
    icon: '🔥',
    category: 'streak',
    rarity: 'rare',
    condition: { type: 'streak_days', days: 7 },
    xpReward: 80,
  }),
  make({
    id: 'streak-30',
    name: { tr: '30 Gün Volkanı', en: '30-Day Volcano' },
    description: { tr: '30 gün üst üste oyna', en: 'Play 30 days in a row' },
    icon: '🌋',
    category: 'streak',
    rarity: 'epic',
    condition: { type: 'streak_days', days: 30 },
    xpReward: 300,
  }),
  make({
    id: 'streak-100',
    name: { tr: '100 Gün Efsanesi', en: '100-Day Legend' },
    description: { tr: '100 gün üst üste oyna', en: 'Play 100 days in a row' },
    icon: '💎',
    category: 'streak',
    rarity: 'legendary',
    condition: { type: 'streak_days', days: 100 },
    xpReward: 1_000,
  }),
];

/** Ustalık rozetleri (6) */
const MASTERY_BADGES: readonly Badge[] = [
  make({
    id: 'first-correct',
    name: { tr: 'İlk Doğru', en: 'First Correct' },
    description: { tr: 'İlk doğru cevabını ver', en: 'Get your first correct answer' },
    icon: '🎯',
    category: 'mastery',
    rarity: 'common',
    condition: { type: 'total_correct', count: 1 },
    xpReward: 10,
  }),
  make({
    id: 'first-perfect',
    name: { tr: 'İlk Mükemmel Quiz', en: 'First Perfect Quiz' },
    description: { tr: 'Hatasız bir quiz tamamla', en: 'Complete a quiz without mistakes' },
    icon: '💯',
    category: 'mastery',
    rarity: 'rare',
    condition: { type: 'perfect_quiz', count: 1 },
    xpReward: 100,
  }),
  make({
    id: 'correct-100',
    name: { tr: '100 Doğru Cevap', en: '100 Correct' },
    description: { tr: 'Toplam 100 doğru cevap ver', en: 'Reach 100 correct answers' },
    icon: '🧠',
    category: 'mastery',
    rarity: 'common',
    condition: { type: 'total_correct', count: 100 },
    xpReward: 50,
  }),
  make({
    id: 'correct-500',
    name: { tr: '500 Doğru Cevap', en: '500 Correct' },
    description: { tr: 'Toplam 500 doğru cevap ver', en: 'Reach 500 correct answers' },
    icon: '🏆',
    category: 'mastery',
    rarity: 'rare',
    condition: { type: 'total_correct', count: 500 },
    xpReward: 200,
  }),
  make({
    id: 'correct-1000',
    name: { tr: '1000 Doğru Cevap', en: '1000 Correct' },
    description: { tr: 'Toplam 1000 doğru cevap ver', en: 'Reach 1000 correct answers' },
    icon: '👑',
    category: 'mastery',
    rarity: 'epic',
    condition: { type: 'total_correct', count: 1_000 },
    xpReward: 500,
  }),
  make({
    id: 'correct-5000',
    name: { tr: '5000 Doğru Cevap', en: '5000 Correct' },
    description: { tr: 'Toplam 5000 doğru cevap ver', en: 'Reach 5000 correct answers' },
    icon: '⭐',
    category: 'mastery',
    rarity: 'legendary',
    condition: { type: 'total_correct', count: 5_000 },
    xpReward: 2_500,
  }),
];

/** Seviye bazlı rozetler (4) */
const LEVEL_BADGES: readonly Badge[] = [
  make({
    id: 'level-10',
    name: { tr: 'Seviye 10', en: 'Level 10' },
    description: { tr: '10. seviyeye ulaş', en: 'Reach level 10' },
    icon: '🏅',
    category: 'special',
    rarity: 'common',
    condition: { type: 'level_reached', level: 10 },
    xpReward: 100,
  }),
  make({
    id: 'level-25',
    name: { tr: 'Seviye 25', en: 'Level 25' },
    description: { tr: '25. seviyeye ulaş', en: 'Reach level 25' },
    icon: '🥇',
    category: 'special',
    rarity: 'rare',
    condition: { type: 'level_reached', level: 25 },
    xpReward: 300,
  }),
  make({
    id: 'level-40',
    name: { tr: 'Seviye 40', en: 'Level 40' },
    description: { tr: '40. seviyeye ulaş', en: 'Reach level 40' },
    icon: '🏆',
    category: 'special',
    rarity: 'epic',
    condition: { type: 'level_reached', level: 40 },
    xpReward: 800,
  }),
  make({
    id: 'level-50',
    name: { tr: 'Seviye 50', en: 'Level 50' },
    description: { tr: 'En yüksek seviyeye ulaş', en: 'Reach the maximum level' },
    icon: '👑',
    category: 'special',
    rarity: 'legendary',
    condition: { type: 'level_reached', level: 50 },
    xpReward: 2_000,
  }),
];

/** Özel rozetler (3) */
const SPECIAL_BADGES: readonly Badge[] = [
  make({
    id: 'first-quiz',
    name: { tr: 'İlk Quiz', en: 'First Quiz' },
    description: { tr: 'İlk quizini tamamla', en: 'Complete your first quiz' },
    icon: '🌟',
    category: 'special',
    rarity: 'common',
    condition: { type: 'mode_played', mode: 'classic', count: 1 },
    xpReward: 25,
  }),
  make({
    id: 'classic-10',
    name: { tr: 'Klasik Tutkunu', en: 'Classic Lover' },
    description: { tr: '10 klasik quiz tamamla', en: 'Complete 10 classic quizzes' },
    icon: '🎮',
    category: 'special',
    rarity: 'common',
    condition: { type: 'mode_played', mode: 'classic', count: 10 },
    xpReward: 75,
  }),
  make({
    id: 'classic-50',
    name: { tr: 'Klasik Ustası', en: 'Classic Master' },
    description: { tr: '50 klasik quiz tamamla', en: 'Complete 50 classic quizzes' },
    icon: '🎖️',
    category: 'special',
    rarity: 'epic',
    condition: { type: 'mode_played', mode: 'classic', count: 50 },
    xpReward: 400,
  }),
];

export const ALL_BADGES: readonly Badge[] = [
  ...CONTINENT_BADGES,
  ...STREAK_BADGES,
  ...MASTERY_BADGES,
  ...LEVEL_BADGES,
  ...SPECIAL_BADGES,
];

export const BADGES_BY_ID: Readonly<Record<string, Badge>> = Object.fromEntries(
  ALL_BADGES.map((b) => [b.id, b]),
);

export const getBadgeById = (id: string): Badge | undefined => BADGES_BY_ID[id];
