<script lang="ts">
	import type { DayStatus } from "$lib/types";
	import { createEventDispatcher } from "svelte";

	export let day: number;
	export let status: DayStatus | undefined;
	export let isToday: boolean = false;
	export let isFuture: boolean = false;

	const dispatch = createEventDispatcher();

	$: classification = status?.classification ?? "NO_DATA";
	$: isEligible = status?.isMessReductionEligible ?? false;
	$: clickable = !isFuture;

	function getColor(c: string): string {
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
				return "text-text-muted";
		}
	}
</script>

<button
	on:click={() => clickable && dispatch("select", { day, status })}
	class="w-full aspect-square rounded-lg text-sm font-medium flex items-center justify-center relative transition-colors
		{getColor(classification)}
		{isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-surface' : ''}
		{isFuture
		? 'opacity-20 cursor-not-allowed'
		: classification === 'NO_DATA'
			? 'opacity-50 hover:opacity-70 hover:bg-surface-lighter/30'
			: 'hover:opacity-80'}"
	disabled={isFuture}
>
	{day}
	{#if isEligible}
		<span
			class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-mess-cut"
		></span>
	{/if}
</button>
