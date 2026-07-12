/**
 * Son tamamlanan quiz'in soru-cevap dökümü.
 * Quiz ekranı doldurur; sonuç ekranı yanlış cevapları öğretici şekilde göstermek için okur.
 * Kalıcı değildir — yalnızca quiz → sonuç geçişi için bellek-içi tutulur.
 */

import { create } from 'zustand';

export interface ReviewItem {
  questionText: string;
  correctText: string;
  /** Kullanıcının seçtiği şık; can bittiği için cevaplanmadıysa null. */
  selectedText: string | null;
  isCorrect: boolean;
}

interface ReviewState {
  items: ReviewItem[];
  setReview: (items: ReviewItem[]) => void;
  clear: () => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  items: [],
  setReview: (items) => set({ items }),
  clear: () => set({ items: [] }),
}));
