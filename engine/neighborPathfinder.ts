/**
 * Komşu zinciri için BFS pathfinder.
 * Ülke grafiği `neighbors` alanından türetilir; iki ülke arası en kısa yolu döner.
 */

import { ALL_COUNTRIES, getCountryById } from '@/data/countries';

const NEIGHBOR_GRAPH: Readonly<Record<string, readonly string[]>> = (() => {
  const map: Record<string, string[]> = {};
  for (const c of ALL_COUNTRIES) {
    map[c.id] = [...c.neighbors];
  }
  return map;
})();

/**
 * Başlangıçtan hedefe en kısa komşu yolunu döner (id dizisi).
 * Yol bulunamazsa null.
 */
export const findShortestPath = (fromId: string, toId: string): string[] | null => {
  if (fromId === toId) return [fromId];
  if (!getCountryById(fromId) || !getCountryById(toId)) return null;

  const visited = new Set<string>([fromId]);
  const parent = new Map<string, string>();
  const queue: string[] = [fromId];

  while (queue.length > 0) {
    const current = queue.shift() as string;
    if (current === toId) break;
    const neighbors = NEIGHBOR_GRAPH[current] ?? [];
    for (const next of neighbors) {
      if (visited.has(next)) continue;
      visited.add(next);
      parent.set(next, current);
      if (next === toId) {
        // Yolu rekonstrüksiyon ile çıkar.
        const path: string[] = [next];
        let cursor = next;
        while (parent.has(cursor)) {
          const p = parent.get(cursor) as string;
          path.unshift(p);
          cursor = p;
        }
        return path;
      }
      queue.push(next);
    }
  }
  return null;
};

/**
 * Birbirine bağlanabilen rastgele bir başlangıç-bitiş çifti seçer.
 */
export const pickConnectedPair = (minDistance: number = 3): { from: string; to: string; optimalSteps: number } | null => {
  const ids = ALL_COUNTRIES.map((c) => c.id);
  for (let attempt = 0; attempt < 50; attempt++) {
    const from = ids[Math.floor(Math.random() * ids.length)];
    const to = ids[Math.floor(Math.random() * ids.length)];
    if (!from || !to || from === to) continue;
    const path = findShortestPath(from, to);
    if (path && path.length - 1 >= minDistance) {
      return { from, to, optimalSteps: path.length - 1 };
    }
  }
  return null;
};

export const getNeighbors = (id: string): readonly string[] => NEIGHBOR_GRAPH[id] ?? [];
