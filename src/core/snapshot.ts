
import { openDB, IDBPDatabase } from 'idb';
import * as jsondiffpatch from 'jsondiffpatch';

export interface StorageSnapshot {
  id: string;
  timestamp: number;
  localStorage: Record<string, string | null>;
  sessionStorage: Record<string, string | null>;
  indexedDB: Record<string, any>;
}

const INTERNAL_DB_NAME = 'storagelens_internal';
const SNAPSHOT_STORE_NAME = 'snapshots';

export class SnapshotManager {
  private diffPatcher: jsondiffpatch.DiffPatcher;

  constructor() {
    this.diffPatcher = jsondiffpatch.create();
  }

  private async getInternalDB(): Promise<IDBPDatabase> {
    return openDB(INTERNAL_DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(SNAPSHOT_STORE_NAME)) {
          db.createObjectStore(SNAPSHOT_STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }

  async capture(): Promise<StorageSnapshot> {
    const localStorageData: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) localStorageData[key] = localStorage.getItem(key);
    }

    const sessionStorageData: Record<string, string | null> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) sessionStorageData[key] = sessionStorage.getItem(key);
    }

    const indexedDBData: Record<string, any> = {};
    if (typeof window !== 'undefined' && window.indexedDB) {
        try {
            const databases = await window.indexedDB.databases();
            for (const dbInfo of databases) {
                if (!dbInfo.name || dbInfo.name === INTERNAL_DB_NAME) continue;
                
                try {
                    const db = await openDB(dbInfo.name, dbInfo.version);
                    const dbDump: Record<string, any> = {};
                    
                    for (const storeName of db.objectStoreNames) {
                         const tx = db.transaction(storeName, 'readonly');
                         const store = tx.objectStore(storeName);
                         const values = await store.getAll();
                         dbDump[storeName] = values;
                    }
                    indexedDBData[dbInfo.name] = dbDump;
                    db.close();
                } catch (e) {
                    console.error(`Failed to snapshot IndexedDB ${dbInfo.name}`, e);
                    indexedDBData[dbInfo.name] = { error: 'Failed to access' };
                }
            }
        } catch (e) {
             console.error('Failed to enumerate databases', e);
        }
    }

    const snapshot: StorageSnapshot = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      localStorage: localStorageData,
      sessionStorage: sessionStorageData,
      indexedDB: indexedDBData,
    };

    await this.persist(snapshot);
    return snapshot;
  }

  async persist(snapshot: StorageSnapshot): Promise<void> {
    const db = await this.getInternalDB();
    await db.put(SNAPSHOT_STORE_NAME, snapshot);
  }

  async getHistory(): Promise<StorageSnapshot[]> {
    const db = await this.getInternalDB();
    const snapshots = await db.getAll(SNAPSHOT_STORE_NAME);
    return snapshots.sort((a, b) => b.timestamp - a.timestamp);
  }

  diff(snapshotA: StorageSnapshot | undefined, snapshotB: StorageSnapshot): jsondiffpatch.Delta | undefined {
      if (!snapshotA) {
          // If no previous snapshot, everything is new in B
          return this.diffPatcher.diff({}, snapshotB);
      }
      return this.diffPatcher.diff(snapshotA, snapshotB);
  }

  diffObjects(left: any, right: any): jsondiffpatch.Delta | undefined {
      return this.diffPatcher.diff(left, right);
  }
}

export const snapshotManager = new SnapshotManager();
