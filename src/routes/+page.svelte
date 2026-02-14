<script lang="ts">
    import StatusCard from "$lib/components/StatusCard.svelte";
    import EventEditor from "$lib/components/EventEditor.svelte";
    import { events, settings, selectedMonth, selectedYear } from "$lib/stores";
    import { addEvent as dbAddEvent, getAllEvents } from "$lib/db";
    import {
        calculateMonth,
        getMonthSummary,
        getCurrentState,
        getNextValidEventType,
    } from "$lib/engine";
    import { v4 as uuid } from "uuid";

    let showEditor = false;

    // Reactive month calculation
    $: monthData = calculateMonth(
        $events,
        $settings,
        $selectedYear,
        $selectedMonth,
    );
    $: summary = getMonthSummary(
        monthData.dayStatuses,
        monthData.messReductionDays,
    );
    $: currentState = getCurrentState($events);
    $: nextType = getNextValidEventType($events, Date.now());

    async function handleAction() {
        showEditor = true;
    }

    async function confirmEvent(
        e: CustomEvent<{ type: "LEAVE" | "RETURN"; timestamp: number }>,
    ) {
        const now = Date.now();

        const newEvent = {
            id: uuid(),
            type: e.detail.type,
            timestamp: e.detail.timestamp,
            createdAt: now,
            updatedAt: now,
        };

        await dbAddEvent(newEvent);
        const allEvents = await getAllEvents();
        events.set(allEvents);
        showEditor = false;
    }

    const MONTH_NAMES = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
</script>

<div class="space-y-5 animate-fade-in">
    <!-- Header -->
    <div>
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p class="text-text-muted text-sm mt-0.5">
            Track your hostel attendance
        </p>
    </div>

    <!-- Status Card -->
    <StatusCard on:action={handleAction} />

    <!-- Monthly Summary -->
    <div
        class="rounded-2xl bg-surface-light/50 border border-surface-lighter/30 p-5"
    >
        <h3 class="text-sm font-medium text-text-muted mb-3">
            {MONTH_NAMES[$selectedMonth]}
            {$selectedYear}
        </h3>
        <div class="grid grid-cols-2 gap-2.5">
            <div class="p-3 rounded-xl bg-present/10 border border-present/10">
                <p class="text-xl font-bold text-present">
                    {summary.presentDays}
                </p>
                <p class="text-xs text-text-muted mt-0.5">Present</p>
            </div>
            <div class="p-3 rounded-xl bg-absent/10 border border-absent/10">
                <p class="text-xl font-bold text-absent">
                    {summary.fullAbsentDays}
                </p>
                <p class="text-xs text-text-muted mt-0.5">Absent</p>
            </div>
            <div
                class="p-3 rounded-xl bg-mess-cut/10 border border-mess-cut/10"
            >
                <p class="text-xl font-bold text-mess-cut">
                    {summary.messReductionDays}
                </p>
                <p class="text-xs text-text-muted mt-0.5">Mess Cut</p>
            </div>
            <div class="p-3 rounded-xl bg-no-data/10 border border-no-data/10">
                <p class="text-xl font-bold text-no-data">
                    {summary.noDataDays}
                </p>
                <p class="text-xs text-text-muted mt-0.5">No Data</p>
            </div>
        </div>
    </div>

    <!-- Quick Info -->
    <div
        class="rounded-2xl bg-surface-light/50 border border-surface-lighter/30 p-4"
    >
        <p class="text-xs text-text-muted leading-relaxed">
            <span class="text-primary font-medium">{$settings.X}+</span>
            consecutive full absent days qualify for mess reduction. Full absent
            = leave before
            <span class="text-leaving font-medium">{$settings.Y_time}</span>
            or return after
            <span class="text-returning font-medium">{$settings.Z_time}</span>.
        </p>
    </div>
</div>

{#if showEditor}
    <EventEditor
        event={null}
        mode="add"
        forceType={nextType === "BOTH" ? null : nextType}
        on:save={confirmEvent}
        on:cancel={() => (showEditor = false)}
    />
{/if}
