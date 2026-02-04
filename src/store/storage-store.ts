import { create } from 'zustand';
import { StorageData, StorageScanner } from '../core/scanner';
import { IndexedDBRecord } from '../core/adapters/indexeddb';
import { StorageRecord } from '../core/adapters/localstorage';
import { CookieRecord } from '../core/adapters/cookies';
import { NetworkLog, NetworkParser } from '../core/adapters/network';

export interface StorageStore {
  data: StorageData | null;
  isLoading: boolean;
  selectedRecord: StorageRecord | CookieRecord | IndexedDBRecord | null;
  selectedCategory: 'localStorage' | 'sessionStorage' | 'cookies' | 'indexedDB' | null;
  
  scan: () => Promise<void>;
  selectRecord: (record: StorageRecord | CookieRecord | IndexedDBRecord | null) => void;
  selectCategory: (category: 'localStorage' | 'sessionStorage' | 'cookies' | 'indexedDB' | null) => void;
  
  view: 'inspector' | 'time-machine' | 'network';
  setView: (view: 'inspector' | 'time-machine' | 'network') => void;

  networkLogs: NetworkLog[];
  isMonitoring: boolean;
  enableNetworkMonitoring: () => void;
  disableNetworkMonitoring: () => void;
  clearNetworkLogs: () => void;
  refreshNetworkLogs: () => void;
}

let performanceObserver: PerformanceObserver | null = null;

export const useStorageStore = create<StorageStore>((set, get) => ({
  data: null,
  isLoading: false,
  selectedRecord: null,
  selectedCategory: null,
  view: 'inspector',

  networkLogs: [],
  isMonitoring: false,

  enableNetworkMonitoring: () => {
    if (performanceObserver) return;
    
    set({ isMonitoring: true });

    // Process existing entries first
    const existingEntries = performance.getEntriesByType('resource');
    
    const initialLogs = existingEntries.map(entry => 
        NetworkParser.fromPerformanceEntry(entry as PerformanceResourceTiming)
    );
    
    set(state => ({ networkLogs: [...state.networkLogs, ...initialLogs] }));

    performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const newLogs = entries.map(entry => 
            NetworkParser.fromPerformanceEntry(entry as PerformanceResourceTiming)
        );
        set(state => ({ networkLogs: [...state.networkLogs, ...newLogs] }));
    });

    performanceObserver.observe({ entryTypes: ['resource'] });
  },

  disableNetworkMonitoring: () => {
    if (performanceObserver) {
        performanceObserver.disconnect();
        performanceObserver = null;
    }
    set({ isMonitoring: false });
  },

  clearNetworkLogs: () => {
      performance.clearResourceTimings();
      set({ networkLogs: [] });
  },

  refreshNetworkLogs: () => {
    const existingEntries = performance.getEntriesByType('resource');
    const logs = existingEntries.map(entry => 
        NetworkParser.fromPerformanceEntry(entry as PerformanceResourceTiming)
    );
    set({ networkLogs: logs });
  },

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
        set({ selectedCategory: category, selectedRecord: null, view: 'inspector' }); // Switch back to inspector on category select
        return;
    }
    
    // Auto-select first record
    let firstRecord = null;
    if (category === 'localStorage' && state.data.localStorage.length > 0) firstRecord = state.data.localStorage[0];
    else if (category === 'sessionStorage' && state.data.sessionStorage.length > 0) firstRecord = state.data.sessionStorage[0];
    else if (category === 'cookies' && state.data.cookies.length > 0) firstRecord = state.data.cookies[0];
    else if (category === 'indexedDB' && state.data.indexedDB.length > 0) firstRecord = state.data.indexedDB[0];

    set({ selectedCategory: category, selectedRecord: firstRecord, view: 'inspector' });
  },
  
  setView: (view) => set({ view }),
}));
