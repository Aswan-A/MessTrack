import { openDB, type IDBPDatabase } from 'idb';
import type { HostelEvent, Settings } from './types';
import { DEFAULT_SETTINGS } from './types';

const DB_NAME = 'hostel-mess-tracker';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                const eventStore = db.createObjectStore('events', { keyPath: 'id' });
                eventStore.createIndex('timestamp', 'timestamp');
                eventStore.createIndex('type', 'type');

                db.createObjectStore('settings', { keyPath: 'key' });
            }
        });
    }
    return dbPromise;
}

// ---- Events ----

export async function getAllEvents(): Promise<HostelEvent[]> {
    const db = await getDB();
    return db.getAll('events');
}

export async function addEvent(event: HostelEvent): Promise<void> {
    const db = await getDB();
    await db.put('events', event);
}

export async function updateEvent(event: HostelEvent): Promise<void> {
    const db = await getDB();
    event.updatedAt = Date.now();
    await db.put('events', event);
}

export async function deleteEvent(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('events', id);
}

export async function clearEvents(): Promise<void> {
    const db = await getDB();
    await db.clear('events');
}

// ---- Settings ----

export async function getSettings(): Promise<Settings> {
    const db = await getDB();
    const record = await db.get('settings', 'config');
    if (record) {
        const { key, ...settings } = record;
        return settings as Settings;
    }
    return { ...DEFAULT_SETTINGS };
}

export async function updateSettings(settings: Settings): Promise<void> {
    const db = await getDB();
    await db.put('settings', { key: 'config', ...settings });
}

// ---- Bulk Operations ----

export async function replaceAllData(events: HostelEvent[], settings: Settings): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(['events', 'settings'], 'readwrite');
    await tx.objectStore('events').clear();
    for (const event of events) {
        await tx.objectStore('events').put(event);
    }
    await tx.objectStore('settings').put({ key: 'config', ...settings });
    await tx.done;
}

export async function hasLocalData(): Promise<boolean> {
    const db = await getDB();
    const count = await db.count('events');
    return count > 0;
}
