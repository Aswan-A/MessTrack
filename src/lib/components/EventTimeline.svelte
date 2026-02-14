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
        <p class="text-text-secondary text-sm">No events recorded yet</p>
        <p class="text-text-secondary text-xs mt-1">
            Tap + to add your first event
        </p>
    </div>
{:else}
    <div class="space-y-2">
        {#each sorted as event}
            <div
                class="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
            >
                <span
                    class="text-xs font-medium px-2 py-1 rounded-lg {event.type ===
                    'LEAVE'
                        ? 'bg-white text-black'
                        : 'border border-white text-white'}"
                >
                    {event.type === "LEAVE" ? "→ Left" : "← Back"}
                </span>

                <div class="flex-1 min-w-0">
                    <p class="text-sm">
                        {formatDate(event.timestamp)} · {formatTime(
                            event.timestamp,
                        )}
                    </p>
                    <p class="text-xs text-text-secondary">
                        {timeAgo(event.timestamp)}
                    </p>
                </div>

                <div class="flex gap-1">
                    <button
                        on:click={() => dispatch("edit", { event })}
                        class="text-xs text-text-secondary hover:text-white px-2 py-1 rounded hover:bg-card-hover transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        on:click={() => dispatch("delete", { event })}
                        class="text-xs text-absent hover:brightness-90 px-2 py-1 rounded transition-colors"
                    >
                        Del
                    </button>
                </div>
            </div>
        {/each}
    </div>
{/if}
