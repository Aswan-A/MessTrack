export interface HostelEvent {
    id: string;
    type: 'LEAVE' | 'RETURN';
    timestamp: number;
    createdAt: number;
    updatedAt: number;
}

export interface Settings {
    X: number;
    Y_time: string; // "HH:mm"
    Z_time: string; // "HH:mm"
    updatedAt: number;
}

export type DayClassification = 'PRESENT' | 'ABSENT' | 'LEAVING' | 'RETURNING' | 'NO_DATA';

export interface DayStatus {
    date: number; // day of month (1-31)
    classification: DayClassification;
    isFullAbsent: boolean;
    isMessReductionEligible: boolean;
    events: HostelEvent[];
}

export interface LeaveBlock {
    startDay: number;
    endDay: number;
    days: number[];
    length: number;
    isMessReductionEligible: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
    X: 3,
    Y_time: '09:00',
    Z_time: '17:00',
    updatedAt: Date.now()
};
