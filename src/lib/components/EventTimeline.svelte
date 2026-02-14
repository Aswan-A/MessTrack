<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { HostelEvent } from "$lib/types";

    export let events: HostelEvent[] = [];

    const dispatch = createEventDispatcher();

    $: sorted = [...events].sort((a, b) => b.timestamp - a.timestamp);

    function formatDate(ts: number): string {
        return new Date(ts).toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    }

    function formatTime(ts: number): string {
        return new Date(ts).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function timeAgo(ts: number): string {
        const diff = Date.now() - ts;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d ago`;
        return `${Math.floor(days / 30)}mo ago`;
    }
</script>

{#if sorted.length === 0}
    <div class="text-center py-12">
        <p class="text-text-muted text-sm">No events recorded yet</p>
        <p class="text-text-muted/60 text-xs mt-1">
            Tap + to add your first event
        </p>
    </div>
{:else}
    <div class="space-y-2">
        {#each sorted as event}
            <div
                class="flex items-center gap-3 p-3 rounded-xl bg-surface-light/50 border border-surface-lighter/30"
            >
                <!-- Type badge -->
                <span
                    class="text-xs font-medium px-2 py-1 rounded-lg {event.type ===
                    'LEAVE'
                        ? 'bg-leaving/15 text-leaving'
                        : 'bg-returning/15 text-returning'}"
                >
                    {event.type === "LEAVE" ? "→ Left" : "← Back"}
                </span>

                <!-- Details -->
                <div class="flex-1 min-w-0">
                    <p class="text-sm">
                        {formatDate(event.timestamp)} · {formatTime(
                            event.timestamp,
                        )}
                    </p>
                    <p class="text-xs text-text-muted/60">
                        {timeAgo(event.timestamp)}
                    </p>
                </div>

                <!-- Actions -->
                <div class="flex gap-1">
                    <button
                        on:click={() => dispatch("edit", { event })}
                        class="text-xs text-text-muted hover:text-text px-2 py-1 rounded hover:bg-surface-lighter/50 transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        on:click={() => dispatch("delete", { event })}
                        class="text-xs text-absent/60 hover:text-absent px-2 py-1 rounded hover:bg-absent/10 transition-colors"
                    >
                        Del
                    </button>
                </div>
            </div>
        {/each}
    </div>
{/if}
