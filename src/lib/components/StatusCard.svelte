<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { currentStatus } from "$lib/stores";

	const dispatch = createEventDispatcher();

	$: status = $currentStatus;
	$: isPresent = status === "PRESENT";
	$: isNoData = status === "NO_DATA";
</script>

<div
	class="rounded-2xl p-5 border {isNoData
		? 'bg-no-data/10 border-no-data/20'
		: isPresent
			? 'bg-present/10 border-present/20'
			: 'bg-absent/10 border-absent/20'}"
>
	<!-- Status indicator -->
	<div class="flex items-center gap-3 mb-4">
		<div
			class="w-3 h-3 rounded-full {isNoData
				? 'bg-no-data'
				: isPresent
					? 'bg-present'
					: 'bg-absent'} {isNoData ? '' : 'animate-pulse-soft'}"
		></div>
		<span
			class="text-sm font-medium text-text-muted uppercase tracking-wide"
			>Current Status</span
		>
	</div>

	<h2
		class="text-2xl font-bold mb-1 {isNoData
			? 'text-no-data'
			: isPresent
				? 'text-present'
				: 'text-absent'}"
	>
		{isNoData ? "No Data" : isPresent ? "In Hostel" : "Away"}
	</h2>
	<p class="text-sm text-text-muted mb-5">
		{isNoData
			? "Add your first event to start tracking"
			: isPresent
				? "You are currently in the hostel"
				: "You are currently away from hostel"}
	</p>

	<!-- Action button -->
	{#if !isNoData}
		<button
			on:click={() => dispatch("action")}
			class="w-full py-3 px-4 rounded-xl font-medium text-sm transition-all active:scale-[0.98] {isPresent
				? 'bg-leaving/15 text-leaving border border-leaving/20 hover:bg-leaving/20'
				: 'bg-returning/15 text-returning border border-returning/20 hover:bg-returning/20'}"
		>
			{#if isPresent}
				Mark as Leaving
			{:else}
				Mark as Returned
			{/if}
		</button>
	{:else}
		<button
			on:click={() => dispatch("action")}
			class="w-full py-3 px-4 rounded-xl font-medium text-sm bg-primary/15 text-primary border border-primary/20 hover:bg-primary/20 transition-all active:scale-[0.98]"
		>
			Add First Event
		</button>
	{/if}
</div>
