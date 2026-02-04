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
      const firstRecord = data.localStorage.length > 0 ? data.localStorage[0] : null;
      set({ data, isLoading: false, selectedCategory: 'localStorage', selectedRecord: firstRecord });
    } catch (error) {
      console.error('Scan failed', error);
      set({ isLoading: false });
    }
  },

  selectRecord: (record) => set({ selectedRecord: record }),
  selectCategory: (category) => {
    const state = useStorageStore.getState();
    if (!state.data) {
        set({ selectedCategory: category, selectedRecord: null });
        return;
    }
    
    // Auto-select first record
    let firstRecord = null;
    if (category === 'localStorage' && state.data.localStorage.length > 0) firstRecord = state.data.localStorage[0];
    else if (category === 'sessionStorage' && state.data.sessionStorage.length > 0) firstRecord = state.data.sessionStorage[0];
    else if (category === 'cookies' && state.data.cookies.length > 0) firstRecord = state.data.cookies[0];
    else if (category === 'indexedDB' && state.data.indexedDB.length > 0) firstRecord = state.data.indexedDB[0];

    set({ selectedCategory: category, selectedRecord: firstRecord });
  },
}));
