<script lang="ts">
    import EventTimeline from "$lib/components/EventTimeline.svelte";
    import EventEditor from "$lib/components/EventEditor.svelte";
    import { events } from "$lib/stores";
    import {
        addEvent as dbAddEvent,
        updateEvent as dbUpdateEvent,
        deleteEvent as dbDeleteEvent,
        getAllEvents,
    } from "$lib/db";
    import { v4 as uuid } from "uuid";
    import type { HostelEvent } from "$lib/types";

    let showEditor = false;
    let editingEvent: HostelEvent | null = null;
    let editorMode: "add" | "edit" = "add";

    function openAddEditor() {
        editingEvent = null;
        editorMode = "add";
        showEditor = true;
    }

    function openEditEditor(e: CustomEvent<{ event: HostelEvent }>) {
        editingEvent = e.detail.event;
        editorMode = "edit";
        showEditor = true;
    }

    async function handleSave(
        e: CustomEvent<{
            type: "LEAVE" | "RETURN";
            timestamp: number;
            id?: string;
        }>,
    ) {
        const now = Date.now();

        if (editorMode === "add") {
            await dbAddEvent({
                id: uuid(),
                type: e.detail.type,
                timestamp: e.detail.timestamp,
                createdAt: now,
                updatedAt: now,
            });
        } else if (e.detail.id) {
            const existing = $events.find((ev) => ev.id === e.detail.id);
            if (existing) {
                await dbUpdateEvent({
                    ...existing,
                    type: e.detail.type,
                    timestamp: e.detail.timestamp,
                    updatedAt: now,
                });
            }
        }

        const allEvents = await getAllEvents();
        events.set(allEvents);
        showEditor = false;
        editingEvent = null;
    }

    async function handleDelete(e: CustomEvent<{ event: HostelEvent }>) {
        await dbDeleteEvent(e.detail.event.id);
        const allEvents = await getAllEvents();
        events.set(allEvents);
    }

    function cancelEditor() {
        showEditor = false;
        editingEvent = null;
    }
</script>

<div class="space-y-6 animate-fade-in">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold">History</h1>
            <p class="text-text-secondary text-sm mt-0.5">
                All attendance events
            </p>
        </div>
        <button
            on:click={openAddEditor}
            class="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-95"
            aria-label="Add event"
        >
            <svg
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 4v16m8-8H4"
                />
            </svg>
        </button>
    </div>

    {#if $events.length > 0}
        <p class="text-xs text-text-secondary">
            {$events.length} event{$events.length !== 1 ? "s" : ""} recorded
        </p>
    {/if}

    <EventTimeline
        events={$events}
        on:edit={openEditEditor}
        on:delete={handleDelete}
    />
</div>

{#if showEditor}
    <EventEditor
        event={editingEvent}
        mode={editorMode}
        on:save={handleSave}
        on:cancel={cancelEditor}
    />
{/if}
