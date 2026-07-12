/**
 * Karıştırma ve seeded random yardımcıları.
 * Quiz seçimi ve günlük challenge için kullanılır.
 */

/**
 * Fisher-Yates shuffle. Yeni dizi döner; girdiyi mutate etmez.
 */
export const shuffle = <T>(arr: readonly T[]): T[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
};

/**
 * Diziden N elemanı eşsiz seçer (replacement yok).
 * count > arr.length ise dizinin kendisi (karıştırılmış) döner.
 */
export const sample = <T>(arr: readonly T[], count: number): T[] =>
  shuffle(arr).slice(0, Math.min(count, arr.length));

/**
 * Diziden tek bir öğe seçer.
 */
export const sampleOne = <T>(arr: readonly T[]): T | undefined =>
  arr[Math.floor(Math.random() * arr.length)];

/**
 * Mulberry32 — tek satırlık seeded random (32-bit).
 * Aynı seed → aynı dizi. Günlük challenge için deterministik gerek.
 */
export const seededRandom = (seed: number): (() => number) => {
  let t = seed | 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4_294_967_296;
  };
};

/**
 * Tarihi (YYYY-MM-DD) deterministik bir 32-bit seed'e çevirir.
 */
export const dateToSeed = (isoDate: string): number => {
  let h = 5381;
  for (let i = 0; i < isoDate.length; i++) {
    h = ((h << 5) + h + isoDate.charCodeAt(i)) | 0;
  }
  return h;
};

/**
 * Seed'li shuffle — günlük challenge gibi deterministik akışlarda kullanılır.
 */
export const seededShuffle = <T>(arr: readonly T[], seed: number): T[] => {
  const rng = seededRandom(seed);
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
};
