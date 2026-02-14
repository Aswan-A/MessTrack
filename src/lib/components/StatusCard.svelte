<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { currentStatus, events as eventsStore } from "$lib/stores";
	import { getNextValidEventType } from "$lib/engine";

	const dispatch = createEventDispatcher();

	$: status = $currentStatus;
	$: isPresent = status === "PRESENT";
	$: isNoData = status === "NO_DATA";
	$: nextType = getNextValidEventType($eventsStore, Date.now());
</script>

<div class="rounded-2xl p-5 border border-border bg-card">
	<div class="flex items-center gap-3 mb-4">
		<div
			class="w-3 h-3 rounded-full {isNoData
				? 'bg-no-data'
				: isPresent
					? 'bg-present'
					: 'bg-absent'} {isNoData ? '' : 'animate-pulse-soft'}"
		></div>
		<span
			class="text-sm font-medium text-text-secondary uppercase tracking-wide"
			>Current Status</span
		>
	</div>

	<h2
		class="text-2xl font-bold mb-1 {isNoData
			? 'text-text-secondary'
			: isPresent
				? 'text-present'
				: 'text-absent'}"
	>
		{isNoData ? "No Data" : isPresent ? "In Hostel" : "Away"}
	</h2>
	<p class="text-sm text-text-secondary mb-5">
		{isNoData
			? "Add your first event to start tracking"
			: isPresent
				? "You are currently in the hostel"
				: "You are currently away from hostel"}
	</p>

	{#if isNoData}
		<button
			on:click={() => dispatch("action")}
			class="w-full py-3 px-4 rounded-xl font-medium text-sm bg-white text-black hover:bg-gray-200 transition-colors active:scale-[0.98]"
		>
			Add First Event
		</button>
	{:else if nextType === "LEAVE"}
		<button
			on:click={() => dispatch("action")}
			class="w-full py-3 px-4 rounded-xl font-medium text-sm bg-leaving text-black hover:brightness-90 transition-all active:scale-[0.98]"
		>
			Mark as Leaving
		</button>
	{:else if nextType === "RETURN"}
		<button
			on:click={() => dispatch("action")}
			class="w-full py-3 px-4 rounded-xl font-medium text-sm bg-returning text-white hover:brightness-90 transition-all active:scale-[0.98]"
		>
			Mark as Returned
		</button>
	{:else}
		<button
			on:click={() => dispatch("action")}
			class="w-full py-3 px-4 rounded-xl font-medium text-sm bg-white text-black hover:bg-gray-200 transition-colors active:scale-[0.98]"
		>
			{isPresent ? "Mark as Leaving" : "Mark as Returned"}
		</button>
	{/if}
</div>
