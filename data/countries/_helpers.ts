/**
 * Ülke verisi yardımcı fonksiyonları.
 * Her ülke için kalıp kod yazmaktan kaçınmak adına
 * createCountry() yalnızca zorunlu alanları alır,
 * eksik veriyi güvenli default'larla doldurur.
 *
 * Bu helper'ın amacı:
 *   1) Veri girişini ~30 alandan ~10-15 alana indirgemek.
 *   2) "Bilmediğim alan null kalsın" prensibini güvenle uygulamak.
 *   3) Gelecekte alan eklenirse bütün ülkelerde kırılmadan default verebilmek.
 */

import type { Country, Difficulty } from '@/types';

/** createCountry() için zorunlu girdi alanları. */
export interface CountryInput {
  id: string;
  iso3: string;
  numericCode: string;

  nameTr: string;
  nameEn: string;
  nameNative: string;
  officialTr: string;
  officialEn: string;

  continent: Country['continent'];
  subregion: string;

  capital: string;
  capitalLat: number;
  capitalLon: number;

  centerLat: number;
  centerLon: number;

  /** Yüzölçümü km² */
  area: number;
  population: number;
  populationRank: number;

  landlocked?: boolean;
  coastlineKm?: number;

  highestPointName?: string;
  highestPointElevation?: number;

  longestRiver?: { name: string; lengthKm: number } | null;
  largestLake?: { name: string; areaKm2: number } | null;

  neighbors?: string[];

  governmentType?: string;
  independenceDate?: string | null;
  unMemberSince?: number | null;
  memberships?: string[];

  languagesOfficial: string[];
  languagesSpoken?: string[];

  demonymTr: string;
  demonymEn: string;

  currencyCode: string;
  currencyNameTr: string;
  currencyNameEn: string;
  currencySymbol: string;

  callingCode: string;
  tld: string;
  drivingSide: 'left' | 'right';
  vehicleCode?: string;
  timezones?: string[];

  flagEmoji: string;
  flagColors: string[];
  flagDescription: string;

  nationalDay?: { date: string; name: string } | null;
  motto?: { original: string; tr: string } | null;
  anthemName?: string;
  anthemOriginal?: string | null;

  fifaCode?: string | null;
  olympicCode?: string | null;

  funFacts?: string[];
  landmarks?: string[];

  majorCities?: Country['majorCities'];

  difficulty: Difficulty;
}

/**
 * Eksik alanları güvenli default'larla doldurarak Country nesnesini üretir.
 * @param input Asgari ülke verisi.
 */
export const createCountry = (input: CountryInput): Country => ({
  id: input.id,
  iso3: input.iso3,
  numericCode: input.numericCode,
  name: {
    tr: input.nameTr,
    en: input.nameEn,
    native: input.nameNative,
    official: { tr: input.officialTr, en: input.officialEn },
  },
  continent: input.continent,
  subregion: input.subregion,
  capital: { name: input.capital, latitude: input.capitalLat, longitude: input.capitalLon },
  coordinates: { latitude: input.centerLat, longitude: input.centerLon },
  area: input.area,
  landlocked: input.landlocked ?? false,
  coastlineKm: input.coastlineKm ?? 0,
  highestPoint: {
    name: input.highestPointName ?? '',
    elevation: input.highestPointElevation ?? 0,
  },
  longestRiver: input.longestRiver ?? null,
  largestLake: input.largestLake ?? null,
  neighbors: input.neighbors ?? [],
  governmentType: input.governmentType ?? '',
  independenceDate: input.independenceDate ?? null,
  unMemberSince: input.unMemberSince ?? null,
  memberships: input.memberships ?? [],
  population: input.population,
  populationRank: input.populationRank,
  languages: {
    official: input.languagesOfficial,
    spoken: input.languagesSpoken ?? input.languagesOfficial,
  },
  demonym: { tr: input.demonymTr, en: input.demonymEn },
  currency: {
    code: input.currencyCode,
    name: { tr: input.currencyNameTr, en: input.currencyNameEn },
    symbol: input.currencySymbol,
  },
  callingCode: input.callingCode,
  tld: input.tld,
  drivingSide: input.drivingSide,
  vehicleCode: input.vehicleCode ?? input.id,
  timezones: input.timezones ?? [],
  flag: {
    emoji: input.flagEmoji,
    svgPath: '',
    colors: input.flagColors,
    description: input.flagDescription,
  },
  nationalDay: input.nationalDay ?? null,
  motto: input.motto ?? null,
  anthem: {
    name: input.anthemName ?? '',
    originalName: input.anthemOriginal ?? null,
  },
  fifaCode: input.fifaCode ?? null,
  olympicCode: input.olympicCode ?? null,
  funFacts: input.funFacts ?? [],
  landmarks: input.landmarks ?? [],
  majorCities: input.majorCities ?? [],
  difficulty: input.difficulty,
});
