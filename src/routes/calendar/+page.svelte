<script lang="ts">
    import Calendar from "$lib/components/Calendar.svelte";
    import DayDetailModal from "$lib/components/DayDetailModal.svelte";
    import EventEditor from "$lib/components/EventEditor.svelte";
    import { events, settings, selectedYear, selectedMonth } from "$lib/stores";
    import {
        calculateMonth,
        getMonthSummary,
        getConflictingEventIds,
    } from "$lib/engine";
    import {
        updateEvent as dbUpdateEvent,
        deleteEvent as dbDeleteEvent,
        addEvent as dbAddEvent,
        getAllEvents,
    } from "$lib/db";
    import { v4 as uuid } from "uuid";
    import type { DayStatus, HostelEvent } from "$lib/types";

    let selectedDay: { day: number; status: DayStatus } | null = null;
    let editingEvent: HostelEvent | null = null;
    let showAddEditor = false;
    let addDefaultDate = "";

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

    function handleAddFromDay(
        e: CustomEvent<{ day: number; month: number; year: number }>,
    ) {
        const { day, month, year } = e.detail;
        const m = String(month + 1).padStart(2, "0");
        const d = String(day).padStart(2, "0");
        addDefaultDate = `${year}-${m}-${d}`;
        showAddEditor = true;
        selectedDay = null;
    }

    async function saveNewEvent(
        e: CustomEvent<{ type: "LEAVE" | "RETURN"; timestamp: number }>,
    ) {
        const now = Date.now();
        // Auto-delete conflicting same-type neighbors
        const conflicts = getConflictingEventIds(
            $events,
            e.detail.type,
            e.detail.timestamp,
        );
        for (const id of conflicts) {
            await dbDeleteEvent(id);
        }
        await dbAddEvent({
            id: uuid(),
            type: e.detail.type,
            timestamp: e.detail.timestamp,
            createdAt: now,
            updatedAt: now,
        });
        const allEvents = await getAllEvents();
        events.set(allEvents);
        showAddEditor = false;
        addDefaultDate = "";
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
            // Auto-delete conflicting same-type neighbors (excluding the event being edited)
            const conflicts = getConflictingEventIds(
                $events,
                e.detail.type,
                e.detail.timestamp,
                e.detail.id,
            );
            for (const id of conflicts) {
                await dbDeleteEvent(id);
            }
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
        <p class="text-text-secondary text-sm mt-0.5">
            Tap any date to view or add events
        </p>
    </div>

    <div class="flex gap-2 overflow-x-auto pb-1">
        <div
            class="flex-shrink-0 px-3 py-2 rounded-xl bg-card border border-border"
        >
            <span class="text-sm font-bold text-present"
                >{summary.presentDays}</span
            >
            <span class="text-xs text-text-secondary ml-1">Present</span>
        </div>
        <div
            class="flex-shrink-0 px-3 py-2 rounded-xl bg-card border border-border"
        >
            <span class="text-sm font-bold text-absent"
                >{summary.fullAbsentDays}</span
            >
            <span class="text-xs text-text-secondary ml-1">Absent</span>
        </div>
        <div
            class="flex-shrink-0 px-3 py-2 rounded-xl bg-card border border-border"
        >
            <span class="text-sm font-bold text-mess-cut"
                >{summary.messReductionDays}</span
            >
            <span class="text-xs text-text-secondary ml-1">Mess Cut</span>
        </div>
    </div>

    <div class="rounded-2xl bg-card border border-border p-4">
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
        on:addEvent={handleAddFromDay}
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

{#if showAddEditor}
    <EventEditor
        event={null}
        mode="add"
        defaultDate={addDefaultDate}
        on:save={saveNewEvent}
        on:cancel={() => {
            showAddEditor = false;
            addDefaultDate = "";
        }}
    />
{/if}
