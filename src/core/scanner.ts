
import { scanCookies, CookieRecord } from './adapters/cookies';
import { scanIndexedDB, IndexedDBRecord } from './adapters/indexeddb';
import { scanLocalStorage, scanSessionStorage, StorageRecord } from './adapters/localstorage';

export interface StorageData {
    cookies: CookieRecord[];
    indexedDB: IndexedDBRecord[];
    localStorage: StorageRecord[];
    sessionStorage: StorageRecord[];
    timestamp: number;
}

export class StorageScanner {
    
    static async scan(): Promise<StorageData> {
        const [groupByDB, cookies] = await Promise.all([
             scanIndexedDB(), 
             scanCookies() 
        ]);
        
        // LocalStorage and SessionStorage are synchronous
        const localStorage = scanLocalStorage();
        const sessionStorage = scanSessionStorage();

        return {
            cookies,
            indexedDB: groupByDB,
            localStorage,
            sessionStorage,
            timestamp: Date.now()
        };
    }
}
