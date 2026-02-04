
import { openDB } from 'idb';

export interface IndexedDBRecord {
  name: string;
  version: number;
  objectStoreNames: string[];
}

export async function scanIndexedDB(): Promise<IndexedDBRecord[]> {
  if (!('indexedDB' in window)) {
    return [];
  }

  try {
    const dbs = await window.indexedDB.databases();
    const results = await Promise.all(
      dbs.map(async (db) => {
        if (!db.name) return null;
        try {
            // We open it just to read the objectStoreNames if they aren't provided by databases()
            // Some browsers provide objectStoreNames in databases(), some don't.
            // Opening every DB might be heavy, but it's the only way to get stores reliably if not present.
            // Note: idb.openDB might trigger version change events if not careful, but we are just reading.
          const connection = await openDB(db.name, db.version);
          const objectStoreNames = Array.from(connection.objectStoreNames);
          connection.close(); // Close immediately
          return {
            name: db.name,
            version: db.version ?? 1,
            objectStoreNames,
          };
        } catch (e) {
          console.error(`Failed to open DB ${db.name}`, e);
          return {
             name: db.name,
             version: db.version ?? 1,
             objectStoreNames: [],
             error: String(e)
          }
        }
      })
    );
    return results.filter((r): r is IndexedDBRecord => r !== null);
  } catch (e) {
    console.error('Failed to scan IndexedDB', e);
    return [];
  }
}
