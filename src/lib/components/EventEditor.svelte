<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { HostelEvent } from "$lib/types";

    export let event: HostelEvent | null = null;
    export let mode: "add" | "edit" = "add";

    const dispatch = createEventDispatcher();

    let eventType: "LEAVE" | "RETURN" = event?.type ?? "LEAVE";
    let dateValue = event
        ? new Date(event.timestamp).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);
    let timeValue = event
        ? new Date(event.timestamp).toTimeString().slice(0, 5)
        : new Date().toTimeString().slice(0, 5);

    function save() {
        const [y, m, d] = dateValue.split("-").map(Number);
        const [h, min] = timeValue.split(":").map(Number);
        const timestamp = new Date(y, m - 1, d, h, min).getTime();

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
            <p class="text-xs font-medium text-text-muted mb-2">Event Type</p>
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
        </div>

        <!-- Date & Time -->
        <div class="space-y-3 mb-5">
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

        <div class="flex gap-3">
            <button
                on:click={() => dispatch("cancel")}
                class="flex-1 py-3 px-4 rounded-xl font-medium text-sm text-text-muted bg-surface border border-surface-lighter hover:bg-surface-lighter transition-colors"
            >
                Cancel
            </button>
            <button
                on:click={save}
                class="flex-1 py-3 px-4 rounded-xl font-medium text-sm text-white bg-primary hover:bg-primary-light transition-colors active:scale-[0.98]"
            >
                {mode === "add" ? "Add Event" : "Save"}
            </button>
        </div>
    </div>
</div>
