/**
 * Soru üretim motoru.
 *
 * 22 farklı kategoriden ülke verisi üzerinden dinamik soru üretir.
 * Yanlış şıklar zorluk seviyesine göre stratejik seçilir:
 *  - easy: yanlışlar farklı kıtalardan
 *  - medium: aynı kıta, farklı alt bölge
 *  - hard: aynı alt bölge
 *  - expert: aynı alt bölge + benzer ülkeler
 *
 * Tekrar engelleme: tüketici askedQuestionIds set'ini her çağrıda günceller.
 */

import i18n from 'i18next';

import { ALL_COUNTRIES, getCountryByAnyCode } from '@/data/countries';
import type {
  Continent,
  Country,
  Difficulty,
  Question,
  QuestionCategory,
  QuestionOption,
} from '@/types';
import { localizedName } from '@/utils/localizedName';
import { sample, sampleOne, shuffle } from '@/utils/shuffleUtils';

interface GenerateOptions {
  category: QuestionCategory | 'mixed';
  difficulty: Difficulty;
  continent?: Continent;
  count: number;
  /** Önceden sorulmuş soruların ID'leri — bu set'tekiler tekrar üretilmez. */
  askedIds?: Set<string>;
}

/** Hangi kategoriler hangi alanları gerektirir — null/eksik veride o ülkeyi atla. */
const CATEGORY_REQUIREMENTS: Partial<Record<QuestionCategory, (c: Country) => boolean>> = {
  capital: (c) => Boolean(c.capital.name),
  flag: (c) => Boolean(c.flag.emoji),
  flag_reverse: (c) => Boolean(c.flag.emoji),
  continent: () => true,
  neighbor: (c) => c.neighbors.length > 0,
  currency: (c) => Boolean(c.currency.code),
  language: (c) => c.languages.official.length > 0,
  calling_code: (c) => Boolean(c.callingCode),
  tld: (c) => Boolean(c.tld),
  driving_side: () => true,
  independence: (c) => c.independenceDate !== null,
  government: (c) => Boolean(c.governmentType),
  highest_point: (c) => c.highestPoint.elevation > 0,
  fun_fact: (c) => c.funFacts.length > 0,
  city: (c) => c.majorCities.some((cc) => !cc.isCapital),
  population_compare: (c) => c.population > 0,
  area_compare: (c) => c.area > 0,
  membership: (c) => c.memberships.length > 0,
  landmark: (c) => c.landmarks.length > 0,
};

const SUPPORTED_CATEGORIES: readonly QuestionCategory[] = Object.keys(
  CATEGORY_REQUIREMENTS,
) as QuestionCategory[];

/**
 * Yanlış şık adayları — zorluk seviyesine göre filtreleme stratejisi.
 */
const candidateDistractors = (
  correct: Country,
  pool: readonly Country[],
  difficulty: Difficulty,
): Country[] => {
  switch (difficulty) {
    case 'easy':
      return pool.filter((c) => c.id !== correct.id && c.continent !== correct.continent);
    case 'medium':
      return pool.filter(
        (c) => c.id !== correct.id && c.continent === correct.continent && c.subregion !== correct.subregion,
      );
    case 'hard':
      return pool.filter(
        (c) => c.id !== correct.id && c.subregion === correct.subregion,
      );
    case 'expert':
      return pool.filter(
        (c) => c.id !== correct.id && (c.subregion === correct.subregion || c.continent === correct.continent),
      );
  }
};

const safeSampleDistractors = (
  correct: Country,
  pool: readonly Country[],
  difficulty: Difficulty,
  needed: number,
  exclude?: (c: Country) => boolean,
): Country[] => {
  const allowed = (c: Country): boolean => (exclude ? !exclude(c) : true);
  let candidates = candidateDistractors(correct, pool, difficulty).filter(allowed);
  // Yetersizse fallback — daha geniş havuza düş.
  if (candidates.length < needed) {
    candidates = pool.filter((c) => c.id !== correct.id && allowed(c));
  }
  return sample(candidates, needed);
};

interface QuestionShape {
  questionText: string;
  correctText: string;
  distractorText: (c: Country) => string;
  explanation: string;
  /** İsteğe bağlı medya — varsa Question.media olarak yerleşir. */
  media?: Question['media'];
  /** Bu koşulu sağlayan ülkeler yanlış şık (distractor) olarak seçilmez. */
  excludeDistractor?: (c: Country) => boolean;
}

const builders: Record<QuestionCategory, (c: Country) => QuestionShape | null> = {
  capital: (c) => ({
    questionText: `${localizedName(c, i18n.language)} ülkesinin başkenti hangisidir?`,
    correctText: c.capital.name,
    distractorText: (d) => d.capital.name,
    explanation: `${localizedName(c, i18n.language)}'nin başkenti ${c.capital.name}'dir.`,
  }),
  flag: (c) => ({
    questionText: 'Bu bayrak hangi ülkeye aittir?',
    correctText: localizedName(c, i18n.language),
    distractorText: (d) => localizedName(d, i18n.language),
    explanation: `${c.flag.emoji} bayrağı ${localizedName(c, i18n.language)}'ye aittir. ${c.flag.description}`,
    media: { type: 'flag_emoji', value: c.flag.emoji },
  }),
  flag_reverse: (c) => ({
    questionText: `${localizedName(c, i18n.language)} ülkesinin bayrağı hangisidir?`,
    correctText: c.flag.emoji,
    distractorText: (d) => d.flag.emoji,
    explanation: `${localizedName(c, i18n.language)}: ${c.flag.description}`,
  }),
  continent: (c) => ({
    questionText: `${localizedName(c, i18n.language)} hangi kıtada yer alır?`,
    correctText: c.continent,
    distractorText: (d) => d.continent,
    explanation: `${localizedName(c, i18n.language)} ${c.continent} kıtasındadır (${c.subregion}).`,
  }),
  neighbor: (c) => {
    // Komşu ISO3 kodlarını datasetteki ülkelere çevir (kod değil ad göster).
    const known = c.neighbors
      .map((code) => getCountryByAnyCode(code))
      .filter((x): x is Country => Boolean(x));
    const neighborCountry = sampleOne(known);
    if (!neighborCountry) return null;
    return {
      questionText: `Aşağıdakilerden hangisi ${localizedName(c, i18n.language)}'nin komşusudur?`,
      correctText: localizedName(neighborCountry, i18n.language),
      distractorText: (d) => localizedName(d, i18n.language),
      explanation: `${localizedName(c, i18n.language)}'nin komşuları: ${known.map((x) => localizedName(x, i18n.language)).join(', ')}.`,
      // Gerçek komşular yanlış şık olmasın (aksi halde birden fazla doğru olur).
      excludeDistractor: (d) => c.neighbors.includes(d.iso3) || c.neighbors.includes(d.id),
    };
  },
  currency: (c) => ({
    questionText: `${localizedName(c, i18n.language)}'nin para birimi nedir?`,
    correctText: `${c.currency.name.tr} (${c.currency.code})`,
    distractorText: (d) => `${d.currency.name.tr} (${d.currency.code})`,
    explanation: `${localizedName(c, i18n.language)} ${c.currency.name.tr} kullanır.`,
  }),
  language: (c) => ({
    questionText: `${localizedName(c, i18n.language)}'nin resmi dili hangisidir?`,
    correctText: c.languages.official[0] ?? '',
    distractorText: (d) => d.languages.official[0] ?? d.languages.spoken[0] ?? '',
    explanation: `${localizedName(c, i18n.language)}'de resmi dil: ${c.languages.official.join(', ')}.`,
  }),
  calling_code: (c) => ({
    questionText: `${localizedName(c, i18n.language)}'nin telefon kodu nedir?`,
    correctText: c.callingCode,
    distractorText: (d) => d.callingCode,
    explanation: `${localizedName(c, i18n.language)}'nin uluslararası arama kodu ${c.callingCode}'dir.`,
  }),
  tld: (c) => ({
    questionText: `${localizedName(c, i18n.language)}'nin internet alan adı (TLD) uzantısı nedir?`,
    correctText: c.tld,
    distractorText: (d) => d.tld,
    explanation: `${localizedName(c, i18n.language)} için TLD: ${c.tld}`,
  }),
  driving_side: (c) => ({
    questionText: `${localizedName(c, i18n.language)}'de trafik hangi yöndedir?`,
    correctText: c.drivingSide === 'left' ? 'Soldan' : 'Sağdan',
    distractorText: (d) => (d.drivingSide === 'left' ? 'Soldan' : 'Sağdan'),
    explanation: `${localizedName(c, i18n.language)}'de ${c.drivingSide === 'left' ? 'soldan' : 'sağdan'} sürülür.`,
  }),
  independence: (c) => {
    if (!c.independenceDate) return null;
    return {
      questionText: `${localizedName(c, i18n.language)} ne zaman bağımsızlığını kazandı?`,
      correctText: c.independenceDate,
      distractorText: (d) => d.independenceDate ?? '—',
      explanation: `${localizedName(c, i18n.language)} bağımsızlık: ${c.independenceDate}.`,
    };
  },
  government: (c) => ({
    questionText: `${localizedName(c, i18n.language)}'nin yönetim biçimi nedir?`,
    correctText: c.governmentType,
    distractorText: (d) => d.governmentType,
    explanation: `${localizedName(c, i18n.language)}: ${c.governmentType}.`,
  }),
  highest_point: (c) => ({
    questionText: `${localizedName(c, i18n.language)}'nin en yüksek noktası hangisidir?`,
    correctText: c.highestPoint.name,
    distractorText: (d) => d.highestPoint.name || '—',
    explanation: `${c.highestPoint.name} (${c.highestPoint.elevation} m), ${localizedName(c, i18n.language)}'nin en yüksek noktasıdır.`,
  }),
  fun_fact: (c) => {
    const fact = sampleOne(c.funFacts);
    if (!fact) return null;
    return {
      questionText: `Bu bilgi hangi ülkeye aittir?\n\n"${fact}"`,
      correctText: localizedName(c, i18n.language),
      distractorText: (d) => localizedName(d, i18n.language),
      explanation: `Bu bilgi ${localizedName(c, i18n.language)} hakkındaydı.`,
    };
  },
  city: (c) => {
    const nonCapital = c.majorCities.find((cc) => !cc.isCapital);
    if (!nonCapital) return null;
    return {
      questionText: `${nonCapital.name} hangi ülkenin şehridir?`,
      correctText: localizedName(c, i18n.language),
      distractorText: (d) => localizedName(d, i18n.language),
      explanation: `${nonCapital.name}, ${localizedName(c, i18n.language)}'de yer alır.`,
    };
  },
  population_compare: (c) => ({
    questionText: `${localizedName(c, i18n.language)}'nin nüfusu yaklaşık ne kadardır?`,
    correctText: c.population.toLocaleString('tr-TR'),
    distractorText: (d) => d.population.toLocaleString('tr-TR'),
    explanation: `${localizedName(c, i18n.language)}'nin nüfusu yaklaşık ${c.population.toLocaleString('tr-TR')} kişidir.`,
  }),
  area_compare: (c) => ({
    questionText: `${localizedName(c, i18n.language)}'nin yüzölçümü yaklaşık ne kadardır?`,
    correctText: `${c.area.toLocaleString('tr-TR')} km²`,
    distractorText: (d) => `${d.area.toLocaleString('tr-TR')} km²`,
    explanation: `${localizedName(c, i18n.language)}'nin yüzölçümü ${c.area.toLocaleString('tr-TR')} km²'dir.`,
  }),
  coastline: (c) => ({
    questionText: `${localizedName(c, i18n.language)} denize kıyısı olan bir ülke midir?`,
    correctText: c.coastlineKm > 0 ? 'Evet' : 'Hayır',
    distractorText: () => '—',
    explanation:
      c.coastlineKm > 0
        ? `${localizedName(c, i18n.language)}'nin yaklaşık ${c.coastlineKm.toLocaleString('tr-TR')} km kıyısı vardır.`
        : `${localizedName(c, i18n.language)} karayla çevrili (landlocked) bir ülkedir.`,
  }),
  membership: (c) => {
    const m = sampleOne(c.memberships);
    if (!m) return null;
    return {
      questionText: `Aşağıdaki uluslararası organizasyonlardan hangisinin üyesi ${localizedName(c, i18n.language)}'dir?`,
      correctText: m,
      distractorText: (d) => sampleOne(d.memberships) ?? '—',
      explanation: `${localizedName(c, i18n.language)}'nin üyelikleri: ${c.memberships.join(', ')}.`,
    };
  },
  landmark: (c) => {
    const lm = sampleOne(c.landmarks);
    if (!lm) return null;
    return {
      questionText: `${lm} hangi ülkededir?`,
      correctText: localizedName(c, i18n.language),
      distractorText: (d) => localizedName(d, i18n.language),
      explanation: `${lm}, ${localizedName(c, i18n.language)}'dedir.`,
    };
  },
  silhouette: () => null,
  map_location: () => null,
  comparison: () => null,
};

const buildOptions = (correctText: string, distractors: string[]): QuestionOption[] => {
  const all = shuffle([
    { id: 'opt-correct', text: correctText },
    ...distractors.map((text, i) => ({ id: `opt-${i}`, text })),
  ]);
  return all;
};

interface BuiltQuestion {
  question: Question;
}

const buildOne = (
  category: QuestionCategory,
  country: Country,
  pool: readonly Country[],
  difficulty: Difficulty,
): BuiltQuestion | null => {
  const builder = builders[category];
  const shape = builder?.(country);
  if (!shape) return null;

  const distractorCountries = safeSampleDistractors(country, pool, difficulty, 3, shape.excludeDistractor);
  const distractors = distractorCountries
    .map(shape.distractorText)
    .filter((s) => s && s !== shape.correctText);

  if (distractors.length < 3) return null;

  const options = buildOptions(shape.correctText, distractors.slice(0, 3));
  const correct = options.find((o) => o.text === shape.correctText);
  if (!correct) return null;

  return {
    question: {
      id: `${category}-${country.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      category,
      difficulty,
      questionText: shape.questionText,
      options,
      correctOptionId: correct.id,
      explanation: shape.explanation,
      relatedCountryId: country.id,
      ...(shape.media ? { media: shape.media } : {}),
    },
  };
};

/**
 * Konfigürasyona göre N adet soru üretir.
 * Üretilemeyenler atlanır; sonuç istenenden az olabilir.
 */
export const generateQuestions = (opts: GenerateOptions): Question[] => {
  const pool = opts.continent
    ? ALL_COUNTRIES.filter((c) => c.continent === opts.continent)
    : ALL_COUNTRIES;

  if (pool.length < 4) return [];

  const categories: readonly QuestionCategory[] =
    opts.category === 'mixed' ? SUPPORTED_CATEGORIES : [opts.category];

  const askedIds = opts.askedIds ?? new Set<string>();
  const questions: Question[] = [];
  const usedKeys = new Set<string>(); // category|countryId — aynı kombinasyon iki kez sorulmasın
  let attempts = 0;
  const maxAttempts = opts.count * 10;

  while (questions.length < opts.count && attempts < maxAttempts) {
    attempts++;
    const cat = categories[Math.floor(Math.random() * categories.length)] as QuestionCategory;
    const requirement = CATEGORY_REQUIREMENTS[cat] ?? (() => true);
    const eligibleCountries = pool.filter(requirement);
    if (eligibleCountries.length === 0) continue;

    const country = sampleOne(eligibleCountries);
    if (!country) continue;

    const key = `${cat}|${country.id}`;
    if (usedKeys.has(key)) continue;

    const built = buildOne(cat, country, pool, opts.difficulty);
    if (!built) continue;

    if (askedIds.has(built.question.id)) continue;

    questions.push(built.question);
    usedKeys.add(key);
    askedIds.add(built.question.id);
  }

  return questions;
};
