<script lang="ts">
	import "../app.css";
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { events, settings } from "$lib/stores";
	import { getAllEvents, getSettings } from "$lib/db";

	let loading = true;

	const navItems = [
		{ path: "/", label: "Home", icon: "home" },
		{ path: "/calendar", label: "Calendar", icon: "calendar" },
		{ path: "/history", label: "History", icon: "history" },
		{ path: "/settings", label: "Settings", icon: "settings" },
	];

	onMount(() => {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.register("/sw.js").catch((e) => {
				console.warn("SW registration failed:", e);
			});
		}

		(async () => {
			try {
				const localEvents = await getAllEvents();
				const localSettings = await getSettings();
				events.set(localEvents);
				settings.set(localSettings);
			} catch (e) {
				console.warn("Failed to load local data:", e);
			}

			loading = false;
		})();
	});

	$: currentPath = $page.url.pathname;
</script>

<svelte:head>
	<title>MessTrack — Hostel Attendance</title>
</svelte:head>

{#if loading}
	<div class="fixed inset-0 flex items-center justify-center bg-bg">
		<div class="text-center animate-fade-in">
			<div class="text-5xl mb-4">🏠</div>
			<h1 class="text-2xl font-bold text-white">MessTrack</h1>
			<p class="text-text-secondary text-sm mt-2">Loading...</p>
			<div
				class="mt-4 w-8 h-8 border-3 border-border border-t-white rounded-full animate-spin mx-auto"
			></div>
		</div>
	</div>
{:else}
	<div class="min-h-dvh pb-20">
		<main class="max-w-lg mx-auto px-4 pt-6">
			<slot />
		</main>

		<nav
			class="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom z-40"
		>
			<div class="max-w-lg mx-auto flex">
				{#each navItems as item}
					<a
						href={item.path}
						class="flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors {currentPath ===
						item.path
							? 'text-white'
							: 'text-text-secondary hover:text-white'}"
					>
						{#if item.icon === "home"}
							<svg
								class="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
								/>
							</svg>
						{:else if item.icon === "calendar"}
							<svg
								class="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						{:else if item.icon === "history"}
							<svg
								class="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						{:else if item.icon === "settings"}
							<svg
								class="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
						{/if}
						<span class="text-[10px] font-medium">{item.label}</span
						>
					</a>
				{/each}
			</div>
		</nav>
	</div>
{/if}

<style>
	.safe-area-bottom {
		padding-bottom: env(safe-area-inset-bottom, 0px);
	}
</style>
