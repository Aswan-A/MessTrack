<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let defaultTimestamp: number = Date.now();

	const dispatch = createEventDispatcher();

	const todayStr = new Date().toISOString().slice(0, 10);
	let dateValue = new Date(defaultTimestamp).toISOString().slice(0, 10);
	let timeValue = new Date(defaultTimestamp).toTimeString().slice(0, 5);

	function confirm() {
		const [y, m, d] = dateValue.split("-").map(Number);
		const [h, min] = timeValue.split(":").map(Number);
		const ts = new Date(y, m - 1, d, h, min).getTime();
		dispatch("confirm", { timestamp: ts });
	}
</script>

<div
	class="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
	on:click={() => dispatch("cancel")}
	on:keydown={(e) => e.key === "Escape" && dispatch("cancel")}
	role="dialog"
	tabindex="-1"
>
	<div
		class="w-full max-w-lg bg-card rounded-t-2xl p-5 animate-slide-up border-t border-border"
		on:click|stopPropagation
		on:keydown|stopPropagation
		role="document"
	>
		<h3 class="text-lg font-semibold mb-4">Select Date & Time</h3>

		<div class="space-y-3 mb-5">
			<div>
				<label
					for="date-input"
					class="block text-xs font-medium text-text-secondary mb-1"
					>Date</label
				>
				<input
					id="date-input"
					type="date"
					bind:value={dateValue}
					max={todayStr}
					class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white transition-all"
				/>
			</div>
			<div>
				<label
					for="time-input"
					class="block text-xs font-medium text-text-secondary mb-1"
					>Time</label
				>
				<input
					id="time-input"
					type="time"
					bind:value={timeValue}
					class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white transition-all"
				/>
			</div>
		</div>

		<div class="flex gap-3">
			<button
				on:click={() => dispatch("cancel")}
				class="flex-1 py-3 px-4 rounded-xl font-medium text-sm text-text-secondary bg-bg border border-border hover:bg-card-hover transition-colors"
			>
				Cancel
			</button>
			<button
				on:click={confirm}
				class="flex-1 py-3 px-4 rounded-xl font-medium text-sm text-black bg-white hover:bg-gray-200 transition-colors active:scale-[0.98]"
			>
				Confirm
			</button>
		</div>
	</div>
</div>
