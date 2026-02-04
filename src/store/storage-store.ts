import { create } from 'zustand';
import { StorageData, StorageScanner } from '../core/scanner';
import { IndexedDBRecord } from '../core/adapters/indexeddb';
import { StorageRecord } from '../core/adapters/localstorage';
import { CookieRecord } from '../core/adapters/cookies';

export interface StorageStore {
  data: StorageData | null;
  isLoading: boolean;
  selectedRecord: StorageRecord | CookieRecord | IndexedDBRecord | null;
  selectedCategory: 'localStorage' | 'sessionStorage' | 'cookies' | 'indexedDB' | null;
  
  scan: () => Promise<void>;
  selectRecord: (record: StorageRecord | CookieRecord | IndexedDBRecord | null) => void;
  selectCategory: (category: 'localStorage' | 'sessionStorage' | 'cookies' | 'indexedDB' | null) => void;
}

export const useStorageStore = create<StorageStore>((set) => ({
  data: null,
  isLoading: false,
  selectedRecord: null,
  selectedCategory: null,

  scan: async () => {
    set({ isLoading: true });
    try {
      const data = await StorageScanner.scan();
      set({ data, isLoading: false, selectedCategory: 'localStorage' });
    } catch (error) {
      console.error('Scan failed', error);
      set({ isLoading: false });
    }
  },

  selectRecord: (record) => set({ selectedRecord: record }),
  selectCategory: (category) => set({ selectedCategory: category, selectedRecord: null }),
}));
