import type { HostelEvent, Settings, DayStatus, LeaveBlock } from './types';

/**
 * Parse "HH:mm" time string into hours and minutes.
 */
function parseTime(timeStr: string): { hours: number; minutes: number } {
    const [h, m] = timeStr.split(':').map(Number);
    return { hours: h, minutes: m };
}

/**
 * Start of a given day (midnight) as timestamp.
 */
function startOfDay(year: number, month: number, day: number): number {
    return new Date(year, month, day, 0, 0, 0, 0).getTime();
}

/**
 * A specific time on a given day as a timestamp.
 */
function timeOnDay(year: number, month: number, day: number, timeStr: string): number {
    const { hours, minutes } = parseTime(timeStr);
    return new Date(year, month, day, hours, minutes, 0, 0).getTime();
}

/**
 * Get number of days in a month.
 */
function daysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

/**
 * Get state at a given time based on events.
 * Returns null if no events exist at all (no data).
 */
function getStateAtTime(events: HostelEvent[], time: number): 'PRESENT' | 'ABSENT' | null {
    const sorted = events
        .filter((e) => e.timestamp <= time)
        .sort((a, b) => a.timestamp - b.timestamp);

    if (sorted.length === 0) return null;

    const last = sorted[sorted.length - 1];
    return last.type === 'LEAVE' ? 'ABSENT' : 'PRESENT';
}

/**
 * Get events that occurred on a specific day.
 */
function getEventsOnDay(events: HostelEvent[], year: number, month: number, day: number): HostelEvent[] {
    const dayStart = startOfDay(year, month, day);
    const dayEnd = startOfDay(year, month, day + 1);
    return events.filter((e) => e.timestamp >= dayStart && e.timestamp < dayEnd);
}

/**
 * Calculate day statuses for a given month.
 * Days with no event data are marked as NO_DATA.
 * Future days are also marked as NO_DATA.
 */
export function calculateDayStatuses(
    events: HostelEvent[],
    settings: Settings,
    year: number,
    month: number
): Map<number, DayStatus> {
    const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
    const totalDays = daysInMonth(year, month);
    const result = new Map<number, DayStatus>();
    const now = Date.now();

    // Find the earliest event timestamp
    const earliestEvent = sorted.length > 0 ? sorted[0].timestamp : null;

    for (let day = 1; day <= totalDays; day++) {
        const dayEvents = getEventsOnDay(sorted, year, month, day);
        const dayStart = startOfDay(year, month, day);
        const dayEnd = startOfDay(year, month, day + 1) - 1;

        // Future days or days before any event exists → NO_DATA
        if (dayStart > now || earliestEvent === null || dayStart < startOfDay(
            new Date(earliestEvent).getFullYear(),
            new Date(earliestEvent).getMonth(),
            new Date(earliestEvent).getDate()
        )) {
            result.set(day, {
                date: day,
                classification: 'NO_DATA',
                isFullAbsent: false,
                isMessReductionEligible: false,
                events: dayEvents
            });
            continue;
        }

        // State at the beginning and end of the day
        const stateAtDayStart = getStateAtTime(sorted, dayStart);
        const stateAtDayEnd = getStateAtTime(sorted, dayEnd > now ? now : dayEnd);

        const hasLeave = dayEvents.some((e) => e.type === 'LEAVE');
        const hasReturn = dayEvents.some((e) => e.type === 'RETURN');

        // Determine classification
        let classification: DayStatus['classification'] = 'PRESENT';

        if (stateAtDayStart === null && !hasLeave && !hasReturn) {
            classification = 'NO_DATA';
        } else if (stateAtDayStart === 'ABSENT' && stateAtDayEnd === 'ABSENT' && !hasReturn && !hasLeave) {
            classification = 'ABSENT';
        } else if (hasLeave && !hasReturn) {
            classification = 'LEAVING';
        } else if (hasReturn && !hasLeave) {
            classification = 'RETURNING';
        } else if (hasLeave && hasReturn) {
            classification = stateAtDayEnd === 'ABSENT' ? 'LEAVING' : 'RETURNING';
        } else if (stateAtDayStart === 'ABSENT') {
            classification = 'ABSENT';
        }

        // Determine if full-day absent
        const yTime = timeOnDay(year, month, day, settings.Y_time);
        const zTime = timeOnDay(year, month, day, settings.Z_time);

        let isFullAbsent = false;

        if (classification === 'ABSENT') {
            isFullAbsent = true;
        } else if (classification === 'LEAVING') {
            const leaveEvents = dayEvents.filter((e) => e.type === 'LEAVE');
            const firstLeave = leaveEvents.sort((a, b) => a.timestamp - b.timestamp)[0];
            if (firstLeave && firstLeave.timestamp < yTime) {
                isFullAbsent = true;
            }
        } else if (classification === 'RETURNING') {
            const returnEvents = dayEvents.filter((e) => e.type === 'RETURN');
            const lastReturn = returnEvents.sort((a, b) => b.timestamp - a.timestamp)[0];
            if (lastReturn && lastReturn.timestamp > zTime) {
                isFullAbsent = true;
            }
        }

        result.set(day, {
            date: day,
            classification,
            isFullAbsent,
            isMessReductionEligible: false,
            events: dayEvents
        });
    }

    return result;
}

/**
 * Find consecutive blocks of full-absent days.
 */
export function findLeaveBlocks(dayStatuses: Map<number, DayStatus>): LeaveBlock[] {
    const blocks: LeaveBlock[] = [];
    let currentBlock: number[] = [];

    const sortedDays = [...dayStatuses.keys()].sort((a, b) => a - b);

    for (const day of sortedDays) {
        const status = dayStatuses.get(day)!;
        if (status.isFullAbsent) {
            if (currentBlock.length === 0 || day === currentBlock[currentBlock.length - 1] + 1) {
                currentBlock.push(day);
            } else {
                if (currentBlock.length > 0) {
                    blocks.push({
                        startDay: currentBlock[0],
                        endDay: currentBlock[currentBlock.length - 1],
                        days: [...currentBlock],
                        length: currentBlock.length,
                        isMessReductionEligible: false
                    });
                }
                currentBlock = [day];
            }
        } else {
            if (currentBlock.length > 0) {
                blocks.push({
                    startDay: currentBlock[0],
                    endDay: currentBlock[currentBlock.length - 1],
                    days: [...currentBlock],
                    length: currentBlock.length,
                    isMessReductionEligible: false
                });
                currentBlock = [];
            }
        }
    }

    if (currentBlock.length > 0) {
        blocks.push({
            startDay: currentBlock[0],
            endDay: currentBlock[currentBlock.length - 1],
            days: [...currentBlock],
            length: currentBlock.length,
            isMessReductionEligible: false
        });
    }

    return blocks;
}

/**
 * Mark mess-reduction eligible days.
 */
export function calculateMessReduction(
    dayStatuses: Map<number, DayStatus>,
    blocks: LeaveBlock[],
    X: number
): Set<number> {
    const eligible = new Set<number>();

    for (const block of blocks) {
        if (block.length >= X) {
            block.isMessReductionEligible = true;
            for (const day of block.days) {
                eligible.add(day);
                const status = dayStatuses.get(day);
                if (status) {
                    status.isMessReductionEligible = true;
                }
            }
        }
    }

    return eligible;
}

/**
 * Full month calculation pipeline.
 */
export function calculateMonth(
    events: HostelEvent[],
    settings: Settings,
    year: number,
    month: number
): { dayStatuses: Map<number, DayStatus>; leaveBlocks: LeaveBlock[]; messReductionDays: Set<number> } {
    const dayStatuses = calculateDayStatuses(events, settings, year, month);
    const leaveBlocks = findLeaveBlocks(dayStatuses);
    const messReductionDays = calculateMessReduction(dayStatuses, leaveBlocks, settings.X);

    return { dayStatuses, leaveBlocks, messReductionDays };
}

/**
 * Get current attendance state.
 */
export function getCurrentState(events: HostelEvent[]): 'PRESENT' | 'ABSENT' | 'NO_DATA' {
    const state = getStateAtTime(events, Date.now());
    return state ?? 'NO_DATA';
}

/**
 * Get summary statistics for a month.
 */
export function getMonthSummary(
    dayStatuses: Map<number, DayStatus>,
    messReductionDays: Set<number>
) {
    let presentDays = 0;
    let absentDays = 0;
    let fullAbsentDays = 0;
    let noDataDays = 0;

    for (const [, status] of dayStatuses) {
        if (status.classification === 'NO_DATA') {
            noDataDays++;
        } else if (status.isFullAbsent) {
            fullAbsentDays++;
            absentDays++;
        } else if (status.classification === 'ABSENT' || status.classification === 'LEAVING' || status.classification === 'RETURNING') {
            absentDays++;
        } else {
            presentDays++;
        }
    }

    return {
        presentDays,
        absentDays,
        fullAbsentDays,
        noDataDays,
        messReductionDays: messReductionDays.size
    };
}

/**
 * Get what the next valid event type should be.
 * LEAVE and RETURN must alternate. First event can be either.
 * If excludeId is provided, that event is ignored (for editing).
 */
export function getNextValidEventType(
    events: HostelEvent[],
    atTimestamp: number,
    excludeId?: string
): 'LEAVE' | 'RETURN' | 'BOTH' {
    const filtered = excludeId
        ? events.filter(e => e.id !== excludeId)
        : events;

    const sorted = [...filtered].sort((a, b) => a.timestamp - b.timestamp);

    if (sorted.length === 0) return 'BOTH';

    // Find the last event before atTimestamp
    const before = sorted.filter(e => e.timestamp <= atTimestamp);
    // Find the first event after atTimestamp
    const after = sorted.filter(e => e.timestamp > atTimestamp);

    const lastBefore = before.length > 0 ? before[before.length - 1] : null;
    const firstAfter = after.length > 0 ? after[0] : null;

    // Must not create same type as adjacent events
    if (lastBefore && firstAfter) {
        // Sandwiched between two events
        if (lastBefore.type === firstAfter.type) {
            // Both same type → only the opposite is valid
            return lastBefore.type === 'LEAVE' ? 'RETURN' : 'LEAVE';
        }
        // They differ → the one that fits the sequence
        return lastBefore.type === 'LEAVE' ? 'RETURN' : 'LEAVE';
    }

    if (lastBefore) {
        // Only events before → must be opposite of last
        return lastBefore.type === 'LEAVE' ? 'RETURN' : 'LEAVE';
    }

    if (firstAfter) {
        // Only events after → must be opposite of first after
        return firstAfter.type === 'LEAVE' ? 'RETURN' : 'LEAVE';
    }

    return 'BOTH';
}

/**
 * Check if a timestamp is in the future (beyond current moment).
 */
export function isFutureTimestamp(timestamp: number): boolean {
    return timestamp > Date.now();
}

/**
 * Check if a day (year, month, day) is in the future.
 */
export function isFutureDay(year: number, month: number, day: number): boolean {
    const now = new Date();
    const target = new Date(year, month, day);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return target > today;
}

/**
 * Get the state at a specific timestamp (exported for use by components).
 */
export function getStateAt(events: HostelEvent[], timestamp: number): 'PRESENT' | 'ABSENT' | null {
    return getStateAtTime(events, timestamp);
}

/**
 * Find event IDs that conflict with a newly inserted event.
 * If the immediate previous or next event has the same type as the new event,
 * it should be auto-deleted to maintain LEAVE/RETURN alternation.
 *
 * Example: LEAVE(1) → RETURN(10), insert RETURN(4)
 *   → RETURN(10) is same type as inserted → auto-delete it
 *   → Result: LEAVE(1) → RETURN(4)
 */
export function getConflictingEventIds(
    events: HostelEvent[],
    newType: 'LEAVE' | 'RETURN',
    newTimestamp: number,
    excludeId?: string
): string[] {
    const filtered = excludeId
        ? events.filter(e => e.id !== excludeId)
        : events;

    const sorted = [...filtered].sort((a, b) => a.timestamp - b.timestamp);
    const toDelete: string[] = [];

    // Find immediate previous event
    const before = sorted.filter(e => e.timestamp < newTimestamp);
    if (before.length > 0) {
        const prevEvent = before[before.length - 1];
        if (prevEvent.type === newType) {
            toDelete.push(prevEvent.id);
        }
    }

    // Find immediate next event
    const after = sorted.filter(e => e.timestamp > newTimestamp);
    if (after.length > 0) {
        const nextEvent = after[0];
        if (nextEvent.type === newType) {
            toDelete.push(nextEvent.id);
        }
    }

    return toDelete;
}
