import { writable, derived, type Writable } from 'svelte/store';
import type { HostelEvent, Settings } from './types';
import { DEFAULT_SETTINGS } from './types';
import { getCurrentState } from './engine';

// ---- Events ----
export const events: Writable<HostelEvent[]> = writable([]);

// ---- Settings ----
export const settings: Writable<Settings> = writable({ ...DEFAULT_SETTINGS });

// ---- Derived: Current Status ----
export const currentStatus = derived(events, ($events) => {
    return getCurrentState($events);
});

// ---- Selected month ----
export const selectedYear = writable(new Date().getFullYear());
export const selectedMonth = writable(new Date().getMonth()); // 0-indexed
