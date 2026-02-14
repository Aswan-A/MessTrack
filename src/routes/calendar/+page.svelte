<script lang="ts">
    import Calendar from "$lib/components/Calendar.svelte";
    import DayDetailModal from "$lib/components/DayDetailModal.svelte";
    import EventEditor from "$lib/components/EventEditor.svelte";
    import { events, settings, selectedYear, selectedMonth } from "$lib/stores";
    import { calculateMonth, getMonthSummary } from "$lib/engine";
    import {
        updateEvent as dbUpdateEvent,
        deleteEvent as dbDeleteEvent,
        getAllEvents,
    } from "$lib/db";
    import type { DayStatus, HostelEvent } from "$lib/types";

    let selectedDay: { day: number; status: DayStatus } | null = null;
    let editingEvent: HostelEvent | null = null;

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

    function handleNavigate(e: CustomEvent<{ year: number; month: number }>) {
        selectedYear.set(e.detail.year);
        selectedMonth.set(e.detail.month);
    }

    function handleDaySelect(
        e: CustomEvent<{ day: number; status: DayStatus }>,
    ) {
        selectedDay = e.detail;
    }

    function closeModal() {
        selectedDay = null;
    }

    function handleEditEvent(e: CustomEvent<{ event: HostelEvent }>) {
        editingEvent = e.detail.event;
        selectedDay = null;
    }

    async function handleDeleteEvent(e: CustomEvent<{ event: HostelEvent }>) {
        await dbDeleteEvent(e.detail.event.id);
        const allEvents = await getAllEvents();
        events.set(allEvents);
        selectedDay = null;
    }

    async function saveEditedEvent(
        e: CustomEvent<{
            type: "LEAVE" | "RETURN";
            timestamp: number;
            id: string;
        }>,
    ) {
        const existing = $events.find((ev) => ev.id === e.detail.id);
        if (existing) {
            await dbUpdateEvent({
                ...existing,
                type: e.detail.type,
                timestamp: e.detail.timestamp,
                updatedAt: Date.now(),
            });
            const allEvents = await getAllEvents();
            events.set(allEvents);
        }
        editingEvent = null;
    }
</script>

<div class="space-y-6 animate-fade-in">
    <div>
        <h1 class="text-2xl font-bold">Calendar</h1>
        <p class="text-text-muted text-sm mt-0.5">
            Monthly attendance overview
        </p>
    </div>

    <!-- Summary strip -->
    <div class="flex gap-2 overflow-x-auto pb-1">
        <div
            class="flex-shrink-0 px-3 py-2 rounded-xl bg-present/10 border border-present/10"
        >
            <span class="text-sm font-bold text-present"
                >{summary.presentDays}</span
            >
            <span class="text-xs text-text-muted ml-1">Present</span>
        </div>
        <div
            class="flex-shrink-0 px-3 py-2 rounded-xl bg-absent/10 border border-absent/10"
        >
            <span class="text-sm font-bold text-absent"
                >{summary.fullAbsentDays}</span
            >
            <span class="text-xs text-text-muted ml-1">Absent</span>
        </div>
        <div
            class="flex-shrink-0 px-3 py-2 rounded-xl bg-mess-cut/10 border border-mess-cut/10"
        >
            <span class="text-sm font-bold text-mess-cut"
                >{summary.messReductionDays}</span
            >
            <span class="text-xs text-text-muted ml-1">Mess Cut</span>
        </div>
    </div>

    <!-- Calendar -->
    <div
        class="rounded-2xl bg-surface-light/50 border border-surface-lighter/30 p-4"
    >
        <Calendar
            year={$selectedYear}
            month={$selectedMonth}
            dayStatuses={monthData.dayStatuses}
            on:navigate={handleNavigate}
            on:select={handleDaySelect}
        />
    </div>
</div>

{#if selectedDay}
    <DayDetailModal
        day={selectedDay.day}
        month={$selectedMonth}
        year={$selectedYear}
        status={selectedDay.status}
        on:close={closeModal}
        on:editEvent={handleEditEvent}
        on:deleteEvent={handleDeleteEvent}
    />
{/if}

{#if editingEvent}
    <EventEditor
        event={editingEvent}
        mode="edit"
        on:save={saveEditedEvent}
        on:cancel={() => (editingEvent = null)}
    />
{/if}
