
export interface StorageRecord {
  key: string;
  value: string;
  type: 'localStorage' | 'sessionStorage';
}

export function scanLocalStorage(): StorageRecord[] {
  if (typeof window === 'undefined') return [];
  
  const results: StorageRecord[] = [];
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
            const value = window.localStorage.getItem(key) || '';
            results.push({ key, value, type: 'localStorage' });
        }
    }
  } catch (e) {
      console.error("Failed to scan localStorage", e);
  }
  return results;
}

export function scanSessionStorage(): StorageRecord[] {
    if (typeof window === 'undefined') return [];

    const results: StorageRecord[] = [];
    try {
      for (let i = 0; i < window.sessionStorage.length; i++) {
          const key = window.sessionStorage.key(i);
          if (key) {
              const value = window.sessionStorage.getItem(key) || '';
              results.push({ key, value, type: 'sessionStorage' });
          }
      }
    } catch(e) {
        console.error("Failed to scan sessionStorage", e);
    }
    return results;
  }
