/**
 * Doğru/Yanlış modu için iddia üretimi.
 * Yarısı gerçekten doğru iddia, yarısı kasıtlı yanlış (ama inandırıcı).
 *
 * Strateji: ülkenin gerçek alanını söyle (DOĞRU) veya başka ülkenin alanını ata (YANLIŞ).
 */

import { ALL_COUNTRIES } from '@/data/countries';
import type { Country, Difficulty } from '@/types';
import { sample, sampleOne, shuffle } from '@/utils/shuffleUtils';

export interface TrueFalseStatement {
  id: string;
  text: string;
  isTrue: boolean;
  explanation: string;
  difficulty: Difficulty;
  relatedCountryId: string;
}

interface BuilderResult {
  trueText: string;
  falseText: (other: Country) => string | null;
  explanationTrue: string;
  explanationFalse: (other: Country) => string;
}

const builders: ReadonlyArray<(c: Country) => BuilderResult | null> = [
  (c) => ({
    trueText: `${c.name.tr}'nin başkenti ${c.capital.name}'dir.`,
    falseText: (o) => (o.capital.name === c.capital.name ? null : `${c.name.tr}'nin başkenti ${o.capital.name}'dir.`),
    explanationTrue: `${c.name.tr}'nin başkenti gerçekten ${c.capital.name}'dir.`,
    explanationFalse: () => `${c.name.tr}'nin başkenti aslında ${c.capital.name}'dir.`,
  }),
  (c) => ({
    trueText: `${c.name.tr} ${c.continent} kıtasında yer alır.`,
    falseText: (o) => (o.continent === c.continent ? null : `${c.name.tr} ${o.continent} kıtasında yer alır.`),
    explanationTrue: `${c.name.tr} ${c.continent} kıtasındadır.`,
    explanationFalse: () => `${c.name.tr} aslında ${c.continent} kıtasındadır.`,
  }),
  (c) => ({
    trueText: `${c.name.tr}'de trafik ${c.drivingSide === 'left' ? 'soldan' : 'sağdan'} akar.`,
    falseText: (o) => (o.drivingSide === c.drivingSide ? null : `${c.name.tr}'de trafik ${o.drivingSide === 'left' ? 'soldan' : 'sağdan'} akar.`),
    explanationTrue: `${c.name.tr}'de trafik gerçekten ${c.drivingSide === 'left' ? 'soldan' : 'sağdan'} akar.`,
    explanationFalse: () => `${c.name.tr}'de aslında ${c.drivingSide === 'left' ? 'soldan' : 'sağdan'} sürülür.`,
  }),
  (c) => {
    const lang = c.languages.official[0];
    if (!lang) return null;
    return {
      trueText: `${c.name.tr}'nin resmi dili ${lang}'dir.`,
      falseText: (o) => {
        const oLang = o.languages.official[0];
        if (!oLang || oLang === lang) return null;
        return `${c.name.tr}'nin resmi dili ${oLang}'dir.`;
      },
      explanationTrue: `${c.name.tr}'nin resmi dili ${lang}.`,
      explanationFalse: () => `${c.name.tr}'nin resmi dili aslında ${lang}.`,
    };
  },
  (c) => ({
    trueText: `${c.name.tr}'nin para birimi ${c.currency.name.tr}'dır.`,
    falseText: (o) =>
      o.currency.code === c.currency.code ? null : `${c.name.tr}'nin para birimi ${o.currency.name.tr}'dır.`,
    explanationTrue: `${c.name.tr} ${c.currency.name.tr} kullanır (${c.currency.code}).`,
    explanationFalse: () => `${c.name.tr} aslında ${c.currency.name.tr} kullanır.`,
  }),
];

const ID = (): string => `tf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const generateTrueFalseStatements = (
  count: number,
  difficulty: Difficulty = 'easy',
): TrueFalseStatement[] => {
  const out: TrueFalseStatement[] = [];
  const candidates = shuffle(ALL_COUNTRIES);
  let i = 0;
  let safety = 0;

  while (out.length < count && safety++ < count * 20) {
    const country = candidates[i % candidates.length];
    i++;
    if (!country) continue;

    const builder = sampleOne(builders);
    const built = builder?.(country);
    if (!built) continue;

    const wantTrue = out.length % 2 === 0;
    if (wantTrue) {
      out.push({
        id: ID(),
        text: built.trueText,
        isTrue: true,
        explanation: built.explanationTrue,
        difficulty,
        relatedCountryId: country.id,
      });
    } else {
      const others = sample(ALL_COUNTRIES.filter((c) => c.id !== country.id), 5);
      let placed = false;
      for (const other of others) {
        const text = built.falseText(other);
        if (text) {
          out.push({
            id: ID(),
            text,
            isTrue: false,
            explanation: built.explanationFalse(other),
            difficulty,
            relatedCountryId: country.id,
          });
          placed = true;
          break;
        }
      }
      if (!placed) continue;
    }
  }

  return shuffle(out);
};
