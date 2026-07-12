/**
 * 50 seviye XP tablosu.
 *
 * Spec'teki ankor seviyeler manuel tanımlanmış,
 * ara seviyeler aralarında interpolasyon ile doldurulmuştur.
 */

import type { Level } from '@/types';

interface AnchorLevel extends Level {}

const ANCHORS: readonly AnchorLevel[] = [
  { level: 1,  title: { tr: 'Çaylak',           en: 'Rookie' },          requiredXP: 0,       icon: '🌱', frameColor: '#8B8B8B' },
  { level: 2,  title: { tr: 'Meraklı',          en: 'Curious' },         requiredXP: 100,     icon: '🔍', frameColor: '#8B8B8B' },
  { level: 3,  title: { tr: 'Öğrenci',          en: 'Student' },         requiredXP: 250,     icon: '📚', frameColor: '#8B8B8B' },
  { level: 4,  title: { tr: 'Harita Okuyucu',   en: 'Map Reader' },      requiredXP: 500,     icon: '🗺️', frameColor: '#8B8B8B' },
  { level: 5,  title: { tr: 'Kaşif',            en: 'Explorer' },        requiredXP: 800,     icon: '🧭', frameColor: '#4ECDC4' },
  { level: 10, title: { tr: 'Gezgin',           en: 'Traveler' },        requiredXP: 2_000,   icon: '✈️', frameColor: '#4ECDC4' },
  { level: 15, title: { tr: 'Haritacı',         en: 'Cartographer' },    requiredXP: 5_000,   icon: '📐', frameColor: '#667EEA' },
  { level: 20, title: { tr: 'Navigator',        en: 'Navigator' },       requiredXP: 10_000,  icon: '⛵', frameColor: '#667EEA' },
  { level: 25, title: { tr: 'Kaptan',           en: 'Captain' },         requiredXP: 20_000,  icon: '🚢', frameColor: '#F093FB' },
  { level: 30, title: { tr: 'Keşifçi',          en: 'Discoverer' },      requiredXP: 35_000,  icon: '🔭', frameColor: '#F093FB' },
  { level: 35, title: { tr: 'Dünya Gezgini',    en: 'World Traveler' },  requiredXP: 55_000,  icon: '🌏', frameColor: '#FFE66D' },
  { level: 40, title: { tr: 'Atlas Ustası',     en: 'Atlas Master' },    requiredXP: 80_000,  icon: '📖', frameColor: '#FFE66D' },
  { level: 45, title: { tr: 'Coğrafya Bilgini', en: 'Geo Scholar' },     requiredXP: 120_000, icon: '🎓', frameColor: '#FF6B6B' },
  { level: 50, title: { tr: 'Dünya Hakimi',     en: 'World Dominator' }, requiredXP: 200_000, icon: '👑', frameColor: '#FF6B6B' },
];

/** Lerp helper. */
const lerp = (a: number, b: number, t: number): number => Math.round(a + (b - a) * t);

const expandLevels = (anchors: readonly AnchorLevel[]): Level[] => {
  const out: Level[] = [];
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i] as AnchorLevel;
    const b = anchors[i + 1] as AnchorLevel;
    out.push(a);
    const gap = b.level - a.level;
    for (let k = 1; k < gap; k++) {
      const t = k / gap;
      out.push({
        level: a.level + k,
        title: a.title, // ara seviyeler için ankor başlığı tekrar edilir
        requiredXP: lerp(a.requiredXP, b.requiredXP, t),
        icon: a.icon,
        frameColor: a.frameColor,
      });
    }
  }
  out.push(anchors[anchors.length - 1] as AnchorLevel);
  return out;
};

export const LEVELS: readonly Level[] = expandLevels(ANCHORS);

/**
 * Toplam XP'ye göre mevcut seviyeyi döner.
 */
export const getLevelForXP = (xp: number): Level => {
  let current: Level = LEVELS[0] as Level;
  for (const lvl of LEVELS) {
    if (xp >= lvl.requiredXP) current = lvl;
    else break;
  }
  return current;
};

/**
 * Mevcut seviyeden bir sonraki seviyeye kadar olan ilerleme oranını (0-1) döner.
 * En yüksek seviyedeyse 1.
 */
export const getLevelProgress = (xp: number): { current: Level; next: Level | null; progress: number } => {
  const current = getLevelForXP(xp);
  const next = LEVELS.find((l) => l.level === current.level + 1) ?? null;
  if (!next) return { current, next: null, progress: 1 };
  const range = next.requiredXP - current.requiredXP;
  const into = xp - current.requiredXP;
  const progress = range <= 0 ? 1 : Math.max(0, Math.min(1, into / range));
  return { current, next, progress };
};
