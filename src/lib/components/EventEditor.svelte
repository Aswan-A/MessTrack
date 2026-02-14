<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { HostelEvent } from "$lib/types";
    import { getNextValidEventType, isFutureTimestamp } from "$lib/engine";
    import { events as eventsStore } from "$lib/stores";

    export let event: HostelEvent | null = null;
    export let mode: "add" | "edit" = "add";
    export let defaultDate: string = "";
    export let forceType: "LEAVE" | "RETURN" | null = null;

    const dispatch = createEventDispatcher();

    // Max date is today
    const todayStr = new Date().toISOString().slice(0, 10);

    let dateValue = event
        ? new Date(event.timestamp).toISOString().slice(0, 10)
        : defaultDate || todayStr;
    let timeValue = event
        ? new Date(event.timestamp).toTimeString().slice(0, 5)
        : new Date().toTimeString().slice(0, 5);

    // Compute timestamp from current date/time inputs
    $: timestamp = (() => {
        const [y, m, d] = dateValue.split("-").map(Number);
        const [h, min] = timeValue.split(":").map(Number);
        return new Date(y, m - 1, d, h, min).getTime();
    })();

    // Determine recommended event type based on surrounding events
    $: recommended = getNextValidEventType($eventsStore, timestamp, event?.id);

    // Event type selection
    let eventType: "LEAVE" | "RETURN" = forceType ?? event?.type ?? "LEAVE";

    // Auto-select recommended type when it changes (but allow override)
    $: {
        if (forceType) {
            eventType = forceType;
        } else if (recommended === "LEAVE" || recommended === "RETURN") {
            eventType = recommended;
        }
    }

    $: isFuture = isFutureTimestamp(timestamp);
    $: isNotRecommended = recommended !== "BOTH" && eventType !== recommended;

    function save() {
        if (isFuture) return;
        dispatch("save", {
            type: eventType,
            timestamp,
            id: event?.id,
        });
    }
</script>

<div
    class="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
    on:click={() => dispatch("cancel")}
    on:keydown={(e) => e.key === "Escape" && dispatch("cancel")}
    role="dialog"
    tabindex="-1"
>
    <div
        class="w-full max-w-lg bg-surface-light rounded-t-2xl p-5 animate-slide-up"
        on:click|stopPropagation
        on:keydown|stopPropagation
        role="document"
    >
        <h3 class="text-lg font-semibold mb-4">
            {mode === "add" ? "Add Event" : "Edit Event"}
        </h3>

        <!-- Event Type -->
        <div class="mb-4">
            <p class="text-xs font-medium text-text-muted mb-2">
                Event Type
                {#if recommended !== "BOTH"}
                    <span class="text-primary/70"
                        >· {recommended === "LEAVE" ? "Leave" : "Return"} recommended</span
                    >
                {/if}
            </p>
            <div class="grid grid-cols-2 gap-2">
                <button
                    on:click={() => (eventType = "LEAVE")}
                    class="py-2.5 rounded-xl text-sm font-medium transition-colors {eventType ===
                    'LEAVE'
                        ? 'bg-leaving/15 text-leaving border border-leaving/30'
                        : 'bg-surface border border-surface-lighter text-text-muted hover:bg-surface-lighter'}"
                >
                    Leave
                </button>
                <button
                    on:click={() => (eventType = "RETURN")}
                    class="py-2.5 rounded-xl text-sm font-medium transition-colors {eventType ===
                    'RETURN'
                        ? 'bg-returning/15 text-returning border border-returning/30'
                        : 'bg-surface border border-surface-lighter text-text-muted hover:bg-surface-lighter'}"
                >
                    Return
                </button>
            </div>

            <!-- Advisory warning -->
            {#if isNotRecommended}
                <p class="text-leaving/70 text-xs mt-2">
                    ⚠ Sequence mismatch — you may need to add another event to
                    keep alternation correct
                </p>
            {/if}
        </div>

        <!-- Date & Time -->
        <div class="space-y-3 mb-4">
            <div>
                <label
                    for="event-date"
                    class="block text-xs font-medium text-text-muted mb-1"
                    >Date</label
                >
                <input
                    id="event-date"
                    type="date"
                    bind:value={dateValue}
                    max={todayStr}
                    class="w-full bg-surface border border-surface-lighter rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
            </div>
            <div>
                <label
                    for="event-time"
                    class="block text-xs font-medium text-text-muted mb-1"
                    >Time</label
                >
                <input
                    id="event-time"
                    type="time"
                    bind:value={timeValue}
                    class="w-full bg-surface border border-surface-lighter rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
            </div>
        </div>

        <!-- Future date warning -->
        {#if isFuture}
            <p class="text-absent/70 text-xs mb-3 text-center">
                Future dates are not allowed
            </p>
        {/if}

        <div class="flex gap-3">
            <button
                on:click={() => dispatch("cancel")}
                class="flex-1 py-3 px-4 rounded-xl font-medium text-sm text-text-muted bg-surface border border-surface-lighter hover:bg-surface-lighter transition-colors"
            >
                Cancel
            </button>
            <button
                on:click={save}
                disabled={isFuture}
                class="flex-1 py-3 px-4 rounded-xl font-medium text-sm text-white bg-primary hover:bg-primary-light transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {mode === "add" ? "Add Event" : "Save"}
            </button>
        </div>
    </div>
</div>
