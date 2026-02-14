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

	function getBg(c: string): string {
		switch (c) {
			case "PRESENT":
				return "bg-present text-black";
			case "ABSENT":
				return "bg-absent text-white";
			case "LEAVING":
				return "bg-leaving text-black";
			case "RETURNING":
				return "bg-returning text-white";
			default:
				return "bg-card text-text-secondary";
		}
	}
</script>

<button
	on:click={() => clickable && dispatch("select", { day, status })}
	class="w-full aspect-square rounded-lg text-sm font-medium flex items-center justify-center relative transition-colors
		{getBg(classification)}
		{isToday ? 'ring-2 ring-white ring-offset-1 ring-offset-bg' : ''}
		{isFuture
		? 'opacity-20 cursor-not-allowed'
		: classification === 'NO_DATA'
			? 'hover:bg-card-hover'
			: 'hover:brightness-90'}"
	disabled={isFuture}
>
	{day}
	{#if isEligible}
		<span
			class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-mess-cut"
		></span>
	{/if}
</button>
