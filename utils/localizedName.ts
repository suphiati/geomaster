import type { Country } from '@/types';

/** Dile göre ülke adı (EN modda İngilizce, aksi halde Türkçe). */
export const localizedName = (c: Pick<Country, 'name'>, lang: string): string =>
  lang.startsWith('en') ? c.name.en : c.name.tr;

/** Genel {tr,en} nesnesinden dile göre metin döndürür (seviye başlığı, rozet adı vb.). */
export const localized = (obj: { tr: string; en: string }, lang: string): string =>
  lang.startsWith('en') ? obj.en : obj.tr;
