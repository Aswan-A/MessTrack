<script lang="ts">
	import type { DayStatus } from "$lib/types";

	export let day: number;
	export let status: DayStatus | undefined;
	export let isToday: boolean = false;

	import { createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher();

	$: classification = status?.classification ?? "NO_DATA";
	$: isEligible = status?.isMessReductionEligible ?? false;

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
	on:click={() => status && dispatch("select", { day, status })}
	class="w-full aspect-square rounded-lg text-sm font-medium flex items-center justify-center relative transition-colors
		{getColor(classification)}
		{isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-surface' : ''}
		{classification !== 'NO_DATA' ? 'hover:opacity-80' : 'opacity-40'}"
	disabled={classification === "NO_DATA"}
>
	{day}
	{#if isEligible}
		<span
			class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-mess-cut"
		></span>
	{/if}
</button>
