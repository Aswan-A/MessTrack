<script lang="ts">
    import StatusCard from "$lib/components/StatusCard.svelte";
    import { events, settings, selectedMonth, selectedYear } from "$lib/stores";
    import { addEvent as dbAddEvent, getAllEvents } from "$lib/db";
    import {
        calculateMonth,
        getMonthSummary,
        getCurrentState,
        getNextValidEventType,
    } from "$lib/engine";
    import { v4 as uuid } from "uuid";

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
        const now = Date.now();
        const type =
            nextType === "BOTH"
                ? currentState === "PRESENT"
                    ? "LEAVE"
                    : "RETURN"
                : nextType;

        await dbAddEvent({
            id: uuid(),
            type,
            timestamp: now,
            createdAt: now,
            updatedAt: now,
        });
        const allEvents = await getAllEvents();
        events.set(allEvents);
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

<div class="sticky top-0 z-10 bg-bg pt-6 pb-3">
    <h1 class="text-2xl font-bold">Dashboard</h1>
    <p class="text-text-secondary text-sm mt-0.5">
        Track your hostel attendance
    </p>
</div>

<div class="space-y-5 pb-24 animate-fade-in">
    <StatusCard on:action={handleAction} />

    <div class="rounded-2xl bg-card border border-border p-5">
        <h3 class="text-sm font-medium text-text-secondary mb-3">
            {MONTH_NAMES[$selectedMonth]}
            {$selectedYear}
        </h3>
        <div class="grid grid-cols-2 gap-2.5">
            <div class="p-3 rounded-xl bg-bg border border-border">
                <p class="text-xl font-bold text-present">
                    {summary.presentDays}
                </p>
                <p class="text-xs text-text-secondary mt-0.5">Present</p>
            </div>
            <div class="p-3 rounded-xl bg-bg border border-border">
                <p class="text-xl font-bold text-absent">
                    {summary.fullAbsentDays}
                </p>
                <p class="text-xs text-text-secondary mt-0.5">Absent</p>
            </div>
            <div class="p-3 rounded-xl bg-bg border border-border">
                <p class="text-xl font-bold text-mess-cut">
                    {summary.messReductionDays}
                </p>
                <p class="text-xs text-text-secondary mt-0.5">Mess Cut</p>
            </div>
            <div class="p-3 rounded-xl bg-bg border border-border">
                <p class="text-xl font-bold text-no-data">
                    {summary.noDataDays}
                </p>
                <p class="text-xs text-text-secondary mt-0.5">No Data</p>
            </div>
        </div>
    </div>

    <div class="rounded-2xl bg-card border border-border p-4">
        <p class="text-xs text-text-secondary leading-relaxed">
            <span class="text-white font-medium">{$settings.X}+</span>
            consecutive full absent days qualify for mess reduction. Full absent
            = leave before
            <span class="text-white font-medium">{$settings.Y_time}</span>
            or return after
            <span class="text-white font-medium">{$settings.Z_time}</span>.
        </p>
    </div>
</div>
