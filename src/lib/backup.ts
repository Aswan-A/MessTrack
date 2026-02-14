/**
 * Local file backup utilities.
 * Export data as JSON file download, import from uploaded JSON file.
 */

import type { HostelEvent, Settings } from './types';
import { getAllEvents, getSettings, replaceAllData } from './db';
import { events, settings } from './stores';

export interface BackupData {
    version: number;
    exportedAt: number;
    events: HostelEvent[];
    settings: Settings;
}

/**
 * Export all data as a downloadable JSON file.
 */
export async function downloadBackup(): Promise<void> {
    const allEvents = await getAllEvents();
    const currentSettings = await getSettings();

    const backup: BackupData = {
        version: 1,
        exportedAt: Date.now(),
        events: allEvents,
        settings: currentSettings
    };

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `mestrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Import data from a JSON backup file.
 * Returns true if successful.
 */
export async function uploadBackup(file: File): Promise<boolean> {
    try {
        const text = await file.text();
        const backup = JSON.parse(text) as BackupData;

        if (!backup.version || !backup.events || !backup.settings) {
            throw new Error('Invalid backup file format');
        }

        await replaceAllData(backup.events, backup.settings);

        // Update stores
        events.set(backup.events);
        settings.set(backup.settings);

        return true;
    } catch (err) {
        console.error('Backup import failed:', err);
        return false;
    }
}
