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

    function classBadge(c: string): string {
        switch (c) {
            case "PRESENT":
                return "bg-present text-black";
            case "ABSENT":
                return "bg-absent text-white";
            case "LEAVING":
                return "bg-leaving text-white";
            case "RETURNING":
                return "bg-returning text-black";
            default:
                return "bg-no-data text-white";
        }
    }

    function formatTime(ts: number): string {
        return new Date(ts).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }
</script>

<div
    class="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
    on:click={() => dispatch("close")}
    on:keydown={(e) => e.key === "Escape" && dispatch("close")}
    role="dialog"
    tabindex="-1"
>
    <div
        class="w-full max-w-lg bg-card rounded-t-2xl p-5 animate-slide-up border-t border-border"
        on:click|stopPropagation
        on:keydown|stopPropagation
        role="document"
    >
        <div class="flex items-center justify-between mb-4">
            <div>
                <h3 class="text-lg font-semibold">
                    {MONTHS[month]}
                    {day}, {year}
                </h3>
                <span
                    class="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded {classBadge(
                        status.classification,
                    )}"
                >
                    {classLabel(status.classification)}
                </span>
            </div>
            <button
                on:click={() => dispatch("close")}
                class="text-text-secondary hover:text-white p-1"
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

        {#if status.isFullAbsent}
            <div
                class="text-xs px-3 py-2 rounded-lg mb-3 {status.isMessReductionEligible
                    ? 'bg-mess-cut text-white'
                    : 'bg-absent text-white'}"
            >
                {status.isMessReductionEligible
                    ? "✓ Eligible for mess reduction"
                    : "Full day absent (not enough consecutive days for mess cut)"}
            </div>
        {/if}

        {#if status.events.length > 0}
            <div class="space-y-2 mb-3">
                <p
                    class="text-xs font-medium text-text-secondary uppercase tracking-wide"
                >
                    Events
                </p>
                {#each status.events.sort((a, b) => a.timestamp - b.timestamp) as event}
                    <div
                        class="flex items-center justify-between p-3 rounded-lg bg-bg border border-border"
                    >
                        <div class="flex items-center gap-2">
                            <span
                                class="text-xs font-medium px-2 py-0.5 rounded {event.type ===
                                'LEAVE'
                                    ? 'bg-white text-black'
                                    : 'border border-white text-white'}"
                            >
                                {event.type}
                            </span>
                            <span class="text-sm text-text-secondary"
                                >{formatTime(event.timestamp)}</span
                            >
                        </div>
                        <div class="flex gap-1">
                            <button
                                on:click={() =>
                                    dispatch("editEvent", { event })}
                                class="text-xs text-text-secondary hover:text-white px-2 py-1 rounded hover:bg-card-hover transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                on:click={() =>
                                    dispatch("deleteEvent", { event })}
                                class="text-xs text-absent hover:brightness-90 px-2 py-1 rounded transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <p class="text-sm text-text-secondary py-3 text-center">
                No events on this day
            </p>
        {/if}

        {#if !future}
            <button
                on:click={() => dispatch("addEvent", { day, month, year })}
                class="w-full mt-2 py-2.5 px-4 rounded-xl text-sm font-medium bg-white text-black hover:bg-gray-200 transition-colors"
            >
                + Add Event on This Day
            </button>
        {/if}
    </div>
</div>
