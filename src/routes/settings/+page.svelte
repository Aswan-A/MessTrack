<script lang="ts">
    import { settings } from "$lib/stores";
    import { updateSettings } from "$lib/db";
    import { downloadBackup, uploadBackup } from "$lib/backup";

    let X = $settings.X;
    let Y_time = $settings.Y_time;
    let Z_time = $settings.Z_time;
    let saveMessage = "";
    let backupMessage = "";
    let fileInput: HTMLInputElement;

    // Update local values when store changes
    $: {
        X = $settings.X;
        Y_time = $settings.Y_time;
        Z_time = $settings.Z_time;
    }

    async function saveSettings() {
        const updated = {
            X,
            Y_time,
            Z_time,
            updatedAt: Date.now(),
        };
        await updateSettings(updated);
        settings.set(updated);
        saveMessage = "Settings saved!";
        setTimeout(() => (saveMessage = ""), 2000);
    }

    async function handleDownload() {
        try {
            await downloadBackup();
            backupMessage = "Backup downloaded!";
        } catch {
            backupMessage = "Download failed";
        }
        setTimeout(() => (backupMessage = ""), 3000);
    }

    async function handleUpload(e: Event) {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        const success = await uploadBackup(file);
        backupMessage = success ? "Backup restored!" : "Invalid backup file";
        setTimeout(() => (backupMessage = ""), 3000);

        // Reset file input
        target.value = "";
    }
</script>

<div class="space-y-6 animate-fade-in">
    <div>
        <h1 class="text-2xl font-bold">Settings</h1>
        <p class="text-text-muted text-sm mt-0.5">Configure attendance rules</p>
    </div>

    <!-- Attendance Rules -->
    <div
        class="rounded-2xl bg-surface-light/50 border border-surface-lighter/30 p-5 space-y-4"
    >
        <h3
            class="text-sm font-semibold uppercase tracking-wider text-text-muted"
        >
            Attendance Rules
        </h3>

        <div>
            <label for="setting-x" class="block text-sm font-medium mb-1.5">
                Minimum consecutive days (X)
            </label>
            <p class="text-xs text-text-muted mb-2">
                Minimum full absent days to qualify for mess reduction
            </p>
            <input
                id="setting-x"
                type="number"
                min="1"
                max="30"
                bind:value={X}
                class="w-full bg-surface border border-surface-lighter rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
        </div>

        <div>
            <label for="setting-y" class="block text-sm font-medium mb-1.5">
                Leave cutoff time (Y)
            </label>
            <p class="text-xs text-text-muted mb-2">
                If you leave before this time, the day counts as full absent
            </p>
            <input
                id="setting-y"
                type="time"
                bind:value={Y_time}
                class="w-full bg-surface border border-surface-lighter rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
        </div>

        <div>
            <label for="setting-z" class="block text-sm font-medium mb-1.5">
                Return cutoff time (Z)
            </label>
            <p class="text-xs text-text-muted mb-2">
                If you return after this time, the day counts as full absent
            </p>
            <input
                id="setting-z"
                type="time"
                bind:value={Z_time}
                class="w-full bg-surface border border-surface-lighter rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
        </div>

        <button
            on:click={saveSettings}
            class="w-full py-3 px-4 rounded-xl font-semibold text-white bg-primary hover:bg-primary-light shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
        >
            Save Settings
        </button>

        {#if saveMessage}
            <p class="text-present text-sm text-center animate-fade-in">
                {saveMessage}
            </p>
        {/if}
    </div>

    <!-- Backup & Restore -->
    <div
        class="rounded-2xl bg-surface-light/50 border border-surface-lighter/30 p-5 space-y-3"
    >
        <h3
            class="text-sm font-semibold uppercase tracking-wider text-text-muted"
        >
            Backup & Restore
        </h3>
        <p class="text-xs text-text-muted">
            Download your data as a JSON file or restore from a previous backup.
        </p>

        <div class="flex gap-3">
            <button
                on:click={handleDownload}
                class="flex-1 py-3 px-4 rounded-xl font-medium text-sm bg-surface border border-surface-lighter hover:bg-surface-lighter transition-colors"
            >
                📥 Download Backup
            </button>
            <button
                on:click={() => fileInput.click()}
                class="flex-1 py-3 px-4 rounded-xl font-medium text-sm bg-surface border border-surface-lighter hover:bg-surface-lighter transition-colors"
            >
                📤 Upload Backup
            </button>
        </div>

        <input
            bind:this={fileInput}
            type="file"
            accept=".json"
            on:change={handleUpload}
            class="hidden"
        />

        {#if backupMessage}
            <p
                class="text-sm text-center animate-fade-in {backupMessage.includes(
                    'Invalid',
                ) || backupMessage.includes('failed')
                    ? 'text-absent'
                    : 'text-present'}"
            >
                {backupMessage}
            </p>
        {/if}
    </div>

    <!-- Footer -->
    <p class="text-center text-xs text-text-muted pb-4">
        MessTrack v1.0 — Your data, your device, your control.
    </p>
</div>
