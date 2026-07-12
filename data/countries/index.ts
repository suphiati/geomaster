/**
 * Tüm ülke verisi barrel export.
 *
 * Tüketiciler ALL_COUNTRIES dizisi üzerinden tek noktada erişir.
 * Kıta bazlı diziler kıta filtreli ekranlar için ayrıca expose edilmiştir.
 *
 * Veri iki kaynaktan birleşir:
 *   1) Manuel (zengin) ülkeler — full veriyle elle girilmiş (funFacts, landmarks, majorCities...).
 *   2) Üretilmiş ülkeler — scripts/seed-countries.mjs ile mledoze + World Bank'tan.
 * Aynı id manuel tarafta varsa üretilmiş kopya atlanır (manuel öncelikli).
 */

import type { Continent, Country } from '@/types';

import { ALL_GENERATED_COUNTRIES } from './_generated';
import { AFRICA_COUNTRIES } from './africa';
import { ASIA_COUNTRIES } from './asia';
import { EUROPE_COUNTRIES } from './europe';
import { NORTH_AMERICA_COUNTRIES } from './north-america';
import { OCEANIA_COUNTRIES } from './oceania';
import { SOUTH_AMERICA_COUNTRIES } from './south-america';
import { TERRITORY_COUNTRIES } from './territories';

export {
  AFRICA_COUNTRIES,
  ASIA_COUNTRIES,
  EUROPE_COUNTRIES,
  NORTH_AMERICA_COUNTRIES,
  OCEANIA_COUNTRIES,
  SOUTH_AMERICA_COUNTRIES,
  TERRITORY_COUNTRIES,
};

/** Elle girilmiş, zengin verili ülkeler (öncelikli). */
const MANUAL_COUNTRIES: readonly Country[] = [
  ...EUROPE_COUNTRIES,
  ...ASIA_COUNTRIES,
  ...AFRICA_COUNTRIES,
  ...NORTH_AMERICA_COUNTRIES,
  ...SOUTH_AMERICA_COUNTRIES,
  ...OCEANIA_COUNTRIES,
  ...TERRITORY_COUNTRIES,
];

const MANUAL_IDS = new Set(MANUAL_COUNTRIES.map((c) => c.id));

/**
 * Tüm ülkeler — zengin manuel ülkeler önce, kalan üretilmiş ülkeler sonra.
 * Manuel tarafta bulunan id'ler üretilmiş listeden çıkarılır (çift kayıt olmaz).
 */
export const ALL_COUNTRIES: readonly Country[] = [
  ...MANUAL_COUNTRIES,
  ...ALL_GENERATED_COUNTRIES.filter((c) => !MANUAL_IDS.has(c.id)),
];

/** Hızlı erişim için id (ISO alpha-2) → Country eşlemesi. */
export const COUNTRIES_BY_ID: Readonly<Record<string, Country>> = Object.fromEntries(
  ALL_COUNTRIES.map((c) => [c.id, c]),
);

/**
 * ID üzerinden ülke döner. Bulunamazsa undefined.
 * @param id ISO 3166-1 alpha-2 kodu (TR, DE, US).
 */
export const getCountryById = (id: string): Country | undefined => COUNTRIES_BY_ID[id.toUpperCase()];

/** ISO3 → Country eşlemesi (borders/komşu alanları ISO3 kod kullanır). */
export const COUNTRIES_BY_ISO3: Readonly<Record<string, Country>> = Object.fromEntries(
  ALL_COUNTRIES.map((c) => [c.iso3, c]),
);

/** ISO 3166-1 alpha-3 kodundan ülke döner. Bulunamazsa undefined. */
export const getCountryByIso3 = (iso3: string): Country | undefined =>
  COUNTRIES_BY_ISO3[iso3.toUpperCase()];

/**
 * ISO2 veya ISO3 koddan ülke döner.
 * Manuel ülkeler komşularda ISO2, üretilmiş ülkeler ISO3 kullandığından ikisini de dener.
 */
export const getCountryByAnyCode = (code: string): Country | undefined =>
  getCountryById(code) ?? getCountryByIso3(code);

/**
 * Belirli bir kıtanın ülkelerini döner.
 */
export const getCountriesByContinent = (continent: Continent): Country[] =>
  ALL_COUNTRIES.filter((c) => c.continent === continent);
