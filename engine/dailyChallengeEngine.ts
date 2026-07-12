/**
 * Günlük challenge motoru.
 * Tarih seed'li deterministik ülke seçimi + 6 aşamalı ipucu sistemi.
 */

import { ALL_COUNTRIES, getCountryById } from '@/data/countries';
import type { Country } from '@/types';
import { dateToSeed, seededRandom } from '@/utils/shuffleUtils';

export interface DailyChallengeHint {
  index: number;
  /** Türkçe metin. */
  text: string;
}

export interface DailyChallenge {
  date: string;
  country: Country;
  hints: DailyChallengeHint[];
}

/** ISO YYYY-MM-DD formatında bugünün tarihi. */
export const todayIso = (): string => new Date().toISOString().slice(0, 10);

/**
 * Verilen tarih için günün ülkesini deterministik olarak seçer.
 */
export const getDailyCountry = (date: string = todayIso()): Country => {
  const rng = seededRandom(dateToSeed(date));
  const idx = Math.floor(rng() * ALL_COUNTRIES.length);
  return ALL_COUNTRIES[idx] as Country;
};

const populationBucket = (pop: number): string => {
  if (pop >= 100_000_000) return '100M+';
  if (pop >= 10_000_000) return '10M – 100M';
  if (pop >= 1_000_000) return '1M – 10M';
  return '1M altı';
};

/**
 * Verilen ülke için 6 ipucu üretir (zordan kolaya doğru).
 */
export const buildHints = (c: Country): DailyChallengeHint[] => {
  const hints: DailyChallengeHint[] = [];
  hints.push({ index: 1, text: `Kıta: ${c.continent}` });
  hints.push({ index: 2, text: `Nüfus aralığı: ${populationBucket(c.population)}` });
  if (c.languages.official[0]) {
    hints.push({ index: 3, text: `Resmi dil: ${c.languages.official[0]}` });
  }
  if (c.neighbors.length > 0) {
    const nId = c.neighbors[0] as string;
    const n = getCountryById(nId);
    hints.push({ index: 4, text: `Bir komşusu: ${n?.flag.emoji ?? ''} ${n?.name.tr ?? nId}` });
  }
  hints.push({ index: 5, text: `Para birimi: ${c.currency.name.tr} (${c.currency.code})` });
  hints.push({ index: 6, text: `Bayrak renkleri: ${c.flag.colors.join(', ')}` });
  return hints;
};

export const getDailyChallenge = (date: string = todayIso()): DailyChallenge => {
  const country = getDailyCountry(date);
  return { date, country, hints: buildHints(country) };
};
