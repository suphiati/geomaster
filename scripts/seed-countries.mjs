/**
 * Ülke verisi seed script'i → data/countries/_generated.ts üretir.
 *
 * Kaynaklar:
 *   1) mledoze/countries (statik JSON): coğrafya + kimlik verisi
 *      (isim, başkent, koordinat, sınırlar, para birimi, dil, bayrak emoji, landlocked...).
 *   2) World Bank SP.POP.TOTL: güncel nüfus (ISO3 eşleşmesiyle).
 *
 * NOT: restcountries.com v3.1 API deprecated edildiği için (2026) mledoze statik
 * dataset'ine geçildi. mledoze nüfus içermediğinden nüfus World Bank'tan alınır.
 *
 * Kullanım:
 *   node scripts/seed-countries.mjs
 *
 * Çıktı: data/countries/_generated.ts → ALL_GENERATED_COUNTRIES export eder.
 * data/countries/index.ts bu diziyi manuel ülkelerle merge eder (id çakışması olmadan).
 *
 * Bazı alanlar kaynakta yoktur ve boş kalır ('highestPoint', 'funFacts', 'landmarks',
 * 'majorCities', 'timezones', 'governmentType'); bunlar manuel zenginleştirilebilir.
 * İlgili quiz kategorileri, eksik veriyi CATEGORY_REQUIREMENTS ile otomatik atlar.
 */

import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const MLEDOZE = 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json';
const WORLDBANK =
  'https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&per_page=400&mrnev=1';

const TR_LANG_LABEL = {
  tur: 'Türkçe',
  eng: 'İngilizce',
  fra: 'Fransızca',
  deu: 'Almanca',
  spa: 'İspanyolca',
  por: 'Portekizce',
  rus: 'Rusça',
  ara: 'Arapça',
  zho: 'Mandarin',
  jpn: 'Japonca',
  hin: 'Hintçe',
  ben: 'Bengalce',
  kor: 'Korece',
  ita: 'İtalyanca',
  nld: 'Felemenkçe',
  pol: 'Lehçe',
  fas: 'Farsça',
  urd: 'Urduca',
  swa: 'Svahili',
  ell: 'Yunanca',
};

const continentMap = {
  Europe: 'Avrupa',
  Asia: 'Asya',
  Africa: 'Afrika',
  Americas: undefined, // Subregion'a bakılır
  Oceania: 'Okyanusya',
  Antarctic: undefined,
};

const guessContinent = (region, subregion) => {
  if (region === 'Americas') {
    if (
      subregion?.includes('North') ||
      subregion === 'Caribbean' ||
      subregion === 'Central America'
    ) {
      return 'Kuzey Amerika';
    }
    return 'Güney Amerika';
  }
  return continentMap[region] ?? 'Asya';
};

const formatCurrencyName = (currencies) => {
  if (!currencies) return ['', '', ''];
  const first = Object.entries(currencies)[0];
  if (!first) return ['', '', ''];
  const [code, info] = first;
  return [code, info?.name ?? '', info?.symbol ?? ''];
};

/** İlk harfi Türkçe kurallarına göre büyütür (ör. "çad" → "Çad", "şili" → "Şili"). */
const capitalize = (s) => (s ? s.charAt(0).toLocaleUpperCase('tr-TR') + s.slice(1) : s);

const fetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json();
};

const main = async () => {
  console.log('> mledoze/countries + World Bank verisi çekiliyor...');
  const [countries, wb] = await Promise.all([fetchJson(MLEDOZE), fetchJson(WORLDBANK)]);

  if (!Array.isArray(countries)) throw new Error('mledoze verisi dizi değil');

  const popByIso3 = new Map();
  for (const row of wb?.[1] ?? []) {
    if (row.countryiso3code && row.value != null) popByIso3.set(row.countryiso3code, row.value);
  }
  console.log(`${countries.length} ülke, ${popByIso3.size} nüfus kaydı alındı.`);

  const entries = countries
    // Başkenti olmayan bağımlı bölgeleri (UM, ıssız adalar vb.) hariç tut.
    .filter((c) => c.cca2 && c.name?.common && c.capital?.[0])
    .map((c) => {
      const continent = guessContinent(c.region, c.subregion);
      const langKeys = Object.keys(c.languages ?? {});
      const langsTr = langKeys.map((k) => TR_LANG_LABEL[k] ?? c.languages[k]).filter(Boolean);
      const [currCode, currName, currSym] = formatCurrencyName(c.currencies);
      const callingCode =
        c.idd?.root && c.idd?.suffixes?.[0]
          ? `${c.idd.root}${c.idd.suffixes[0]}`
          : c.idd?.root ?? '';
      const tld = c.tld?.[0] ?? '';
      const driving = c.car?.side === 'left' ? 'left' : 'right';
      const tr = capitalize(c.translations?.tur?.common ?? c.name.common);
      const trOff = capitalize(c.translations?.tur?.official ?? c.name.official);
      const population = popByIso3.get(c.cca3) ?? 0;
      const nativeName = c.name.nativeName
        ? Object.values(c.name.nativeName)[0]?.common ?? c.name.common
        : c.name.common;

      return {
        id: c.cca2,
        iso3: c.cca3,
        numericCode: c.ccn3 ?? '',
        nameTr: tr,
        nameEn: c.name.common,
        nameNative: nativeName,
        officialTr: trOff,
        officialEn: c.name.official,
        continent,
        subregion: c.subregion ?? '',
        capital: c.capital?.[0] ?? '',
        capitalLat: c.capitalInfo?.latlng?.[0] ?? c.latlng?.[0] ?? 0,
        capitalLon: c.capitalInfo?.latlng?.[1] ?? c.latlng?.[1] ?? 0,
        centerLat: c.latlng?.[0] ?? 0,
        centerLon: c.latlng?.[1] ?? 0,
        area: c.area ?? 0,
        population,
        populationRank: 0,
        landlocked: c.landlocked ?? false,
        coastlineKm: 0,
        neighbors: c.borders ?? [],
        independenceDate: null,
        unMemberSince: c.unMember ? 1945 : null,
        memberships: c.unMember ? ['BM'] : [],
        languagesOfficial: langsTr,
        demonymTr: '',
        demonymEn: c.demonyms?.eng?.m ?? '',
        currencyCode: currCode,
        currencyNameTr: currName,
        currencyNameEn: currName,
        currencySymbol: currSym,
        callingCode,
        tld,
        drivingSide: driving,
        timezones: c.timezones ?? [],
        flagEmoji: c.flag ?? '',
        flagColors: [],
        flagDescription: '',
        difficulty:
          population > 50_000_000 ? 'easy' : population > 10_000_000 ? 'medium' : 'hard',
      };
    });

  // Nüfusa göre azalan sırada populationRank ata (nüfusu bilinenler).
  [...entries]
    .filter((e) => e.population > 0)
    .sort((a, b) => b.population - a.population)
    .forEach((e, i) => {
      e.populationRank = i + 1;
    });

  const out = `/* eslint-disable */
/**
 * OTOMATIK ÜRETİLDİ — mledoze/countries + World Bank kaynaklarıyla, ${new Date()
   .toISOString()
   .slice(0, 10)} tarihinde.
 * Manuel düzenlemeler kaybolur; yeniden üretmek için: node scripts/seed-countries.mjs
 */

import { createCountry } from './_helpers';
import type { Country } from '@/types';

const RAW = ${JSON.stringify(entries, null, 2)} as const;

export const ALL_GENERATED_COUNTRIES: readonly Country[] = RAW.map((r) => createCountry(r as never));
`;

  const outPath = resolve(process.cwd(), 'data/countries/_generated.ts');
  await writeFile(outPath, out, 'utf-8');
  console.log(`✓ ${outPath} yazildi (${entries.length} ulke).`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
