<script lang="ts">
    import DayCell from "./DayCell.svelte";
    import type { DayStatus } from "$lib/types";
    import { isFutureDay } from "$lib/engine";
    import { createEventDispatcher } from "svelte";

    export let year: number;
    export let month: number;
    export let dayStatuses: Map<number, DayStatus>;

    const dispatch = createEventDispatcher();

    const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const MONTHS = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    $: firstDayOfWeek = new Date(year, month, 1).getDay();
    $: daysInMonth = new Date(year, month + 1, 0).getDate();
    $: today = new Date();
    $: isCurrentMonth =
        today.getFullYear() === year && today.getMonth() === month;

    function prevMonth() {
        let m = month - 1;
        let y = year;
        if (m < 0) {
            m = 11;
            y--;
        }
        dispatch("navigate", { year: y, month: m });
    }

    function nextMonth() {
        let m = month + 1;
        let y = year;
        if (m > 11) {
            m = 0;
            y++;
        }
        dispatch("navigate", { year: y, month: m });
    }
</script>

<div class="flex items-center justify-between mb-4">
    <button
        on:click={prevMonth}
        class="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-white hover:bg-card-hover transition-colors"
        aria-label="Previous month"
    >
        <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 19l-7-7 7-7"
            />
        </svg>
    </button>
    <h2 class="text-base font-semibold">{MONTHS[month]} {year}</h2>
    <button
        on:click={nextMonth}
        class="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-white hover:bg-card-hover transition-colors"
        aria-label="Next month"
    >
        <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 5l7 7-7 7"
            />
        </svg>
    </button>
</div>

<div class="grid grid-cols-7 gap-1 mb-1">
    {#each WEEKDAYS as day}
        <div class="text-center text-xs font-medium text-text-secondary py-1">
            {day}
        </div>
    {/each}
</div>

<div class="grid grid-cols-7 gap-1">
    {#each Array(firstDayOfWeek) as _}
        <div></div>
    {/each}
    {#each Array(daysInMonth) as _, i}
        {@const day = i + 1}
        <DayCell
            {day}
            status={dayStatuses.get(day)}
            isToday={isCurrentMonth && today.getDate() === day}
            isFuture={isFutureDay(year, month, day)}
            on:select
        />
    {/each}
</div>

<div class="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-xs text-text-secondary">
    <span class="flex items-center gap-1.5"
        ><span class="w-2.5 h-2.5 rounded-sm bg-present"></span> Present</span
    >
    <span class="flex items-center gap-1.5"
        ><span class="w-2.5 h-2.5 rounded-sm bg-present relative"
            ><span
                class="absolute bottom-0 right-0 text-[6px] font-bold text-black/70"
                >↗</span
            ></span
        > Leaving</span
    >
    <span class="flex items-center gap-1.5"
        ><span class="w-2.5 h-2.5 rounded-sm bg-present relative"
            ><span
                class="absolute bottom-0 right-0 text-[6px] font-bold text-black/70"
                >↙</span
            ></span
        > Returning</span
    >
    <span class="flex items-center gap-1.5"
        ><span class="w-2.5 h-2.5 rounded-sm bg-absent"></span> Absent</span
    >
    <span class="flex items-center gap-1.5"
        ><span class="w-2.5 h-2.5 rounded-full bg-mess-cut"></span> Mess Cut</span
    >
</div>
