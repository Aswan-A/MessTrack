<script lang="ts">
    import type { DayStatus, HostelEvent } from "$lib/types";
    import { isFutureDay } from "$lib/engine";
    import { createEventDispatcher } from "svelte";

    export let day: number;
    export let month: number;
    export let year: number;
    export let status: DayStatus;

    const dispatch = createEventDispatcher();

    const MONTHS = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    $: future = isFutureDay(year, month, day);

    function classLabel(c: string): string {
        switch (c) {
            case "PRESENT":
                return "Present";
            case "ABSENT":
                return "Absent";
            case "LEAVING":
                return "Leaving";
            case "RETURNING":
                return "Returning";
            case "NO_DATA":
                return "No Data";
            default:
                return c;
        }
    }

    function classColor(c: string): string {
        switch (c) {
            case "PRESENT":
                return "bg-present/15 text-present";
            case "ABSENT":
                return "bg-absent/15 text-absent";
            case "LEAVING":
                return "bg-leaving/15 text-leaving";
            case "RETURNING":
                return "bg-returning/15 text-returning";
            default:
                return "bg-no-data/15 text-no-data";
        }
    }

    function formatTime(ts: number): string {
        return new Date(ts).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }
</script>

<!-- Backdrop -->
<div
    class="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
    on:click={() => dispatch("close")}
    on:keydown={(e) => e.key === "Escape" && dispatch("close")}
    role="dialog"
    tabindex="-1"
>
    <div
        class="w-full max-w-lg bg-surface-light rounded-t-2xl p-5 animate-slide-up"
        on:click|stopPropagation
        on:keydown|stopPropagation
        role="document"
    >
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
            <div>
                <h3 class="text-lg font-semibold">
                    {MONTHS[month]}
                    {day}, {year}
                </h3>
                <span
                    class="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded {classColor(
                        status.classification,
                    )}"
                >
                    {classLabel(status.classification)}
                </span>
            </div>
            <button
                on:click={() => dispatch("close")}
                class="text-text-muted hover:text-text p-1"
                aria-label="Close"
            >
                <svg
                    class="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>

        <!-- Eligibility -->
        {#if status.isFullAbsent}
            <div
                class="text-xs px-3 py-2 rounded-lg mb-3 {status.isMessReductionEligible
                    ? 'bg-mess-cut/10 text-mess-cut'
                    : 'bg-absent/10 text-absent'}"
            >
                {status.isMessReductionEligible
                    ? "✓ Eligible for mess reduction"
                    : "Full day absent (not enough consecutive days for mess cut)"}
            </div>
        {/if}

        <!-- Events -->
        {#if status.events.length > 0}
            <div class="space-y-2 mb-3">
                <p
                    class="text-xs font-medium text-text-muted uppercase tracking-wide"
                >
                    Events
                </p>
                {#each status.events.sort((a, b) => a.timestamp - b.timestamp) as event}
                    <div
                        class="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-surface-lighter/30"
                    >
                        <div class="flex items-center gap-2">
                            <span
                                class="text-xs font-medium px-2 py-0.5 rounded {event.type ===
                                'LEAVE'
                                    ? 'bg-leaving/15 text-leaving'
                                    : 'bg-returning/15 text-returning'}"
                            >
                                {event.type}
                            </span>
                            <span class="text-sm text-text-muted"
                                >{formatTime(event.timestamp)}</span
                            >
                        </div>
                        <div class="flex gap-1">
                            <button
                                on:click={() =>
                                    dispatch("editEvent", { event })}
                                class="text-xs text-text-muted hover:text-text px-2 py-1 rounded hover:bg-surface-lighter/50 transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                on:click={() =>
                                    dispatch("deleteEvent", { event })}
                                class="text-xs text-absent/70 hover:text-absent px-2 py-1 rounded hover:bg-absent/10 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <p class="text-sm text-text-muted py-3 text-center">
                No events on this day
            </p>
        {/if}

        <!-- Add Event button (only non-future days) -->
        {#if !future}
            <button
                on:click={() => dispatch("addEvent", { day, month, year })}
                class="w-full mt-2 py-2.5 px-4 rounded-xl text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors"
            >
                + Add Event on This Day
            </button>
        {/if}
    </div>
</div>
