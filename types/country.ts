/**
 * Ülke ve şehir tip tanımları.
 * Coğrafya, demografi, siyasi yapı, kültür ve sembol verilerini kapsar.
 */

export type Continent =
  | 'Afrika'
  | 'Asya'
  | 'Avrupa'
  | 'Kuzey Amerika'
  | 'Güney Amerika'
  | 'Okyanusya';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type DrivingSide = 'left' | 'right';

export interface LocalizedName {
  tr: string;
  en: string;
  native: string;
  official: {
    tr: string;
    en: string;
  };
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CapitalInfo extends Coordinates {
  name: string;
}

export interface ElevationPoint {
  name: string;
  /** Metre cinsinden yükseklik. */
  elevation: number;
}

export interface RiverInfo {
  name: string;
  lengthKm: number;
}

export interface LakeInfo {
  name: string;
  areaKm2: number;
}

export interface CurrencyInfo {
  code: string;
  name: { tr: string; en: string };
  symbol: string;
}

export interface FlagInfo {
  emoji: string;
  /** Asset path veya URL. Eksik kaynaklar için boş string olabilir. */
  svgPath: string;
  colors: string[];
  description: string;
}

export interface NationalDay {
  /** ISO formatında tarih (yıllık tekrar eden, örn. '--04-23' veya '2026-10-29'). */
  date: string;
  name: string;
}

export interface Motto {
  original: string;
  tr: string;
}

export interface Anthem {
  name: string;
  originalName: string | null;
}

export interface City {
  name: string;
  population: number;
  isCapital: boolean;
  latitude: number;
  longitude: number;
  region: string | null;
}

export interface Country {
  /** ISO 3166-1 alpha-2 kodu (TR, DE, US). */
  id: string;
  /** ISO 3166-1 alpha-3 kodu (TUR, DEU, USA). */
  iso3: string;
  /** ISO 3166-1 sayısal kod (792, 276, 840). */
  numericCode: string;

  name: LocalizedName;
  continent: Continent;
  subregion: string;

  capital: CapitalInfo;
  coordinates: Coordinates;

  /** Yüzölçümü (km²). */
  area: number;
  landlocked: boolean;
  /** Kıyı uzunluğu (km). */
  coastlineKm: number;

  highestPoint: ElevationPoint;
  longestRiver: RiverInfo | null;
  largestLake: LakeInfo | null;

  /** Komşu ülke ISO alpha-2 kodları. */
  neighbors: string[];

  governmentType: string;
  /** ISO formatında bağımsızlık tarihi veya null. */
  independenceDate: string | null;
  unMemberSince: number | null;
  /** NATO, AB, ASEAN, G20, G7, BRICS vb. */
  memberships: string[];

  population: number;
  populationRank: number;

  languages: {
    official: string[];
    spoken: string[];
  };

  demonym: { tr: string; en: string };

  currency: CurrencyInfo;

  callingCode: string;
  tld: string;
  drivingSide: DrivingSide;
  vehicleCode: string;
  timezones: string[];

  flag: FlagInfo;

  nationalDay: NationalDay | null;
  motto: Motto | null;
  anthem: Anthem;

  fifaCode: string | null;
  olympicCode: string | null;

  funFacts: string[];
  landmarks: string[];

  majorCities: City[];

  difficulty: Difficulty;
}
