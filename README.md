# MessTrack — Hostel Attendance & Mess Reduction PWA

A privacy-first, offline-capable PWA for tracking hostel leave and calculating mess reduction days. All data stays on your device.

## Features

- **Event-based attendance** — log LEAVE/RETURN with timestamps
- **Auto-calculate** full-day absences & mess reduction eligibility
- **Calendar view** — color-coded monthly overview
- **Offline-first PWA** — installable, works without internet
- **Local backup** — download/upload JSON backup files
- **No server, no login** — everything stays in your browser (IndexedDB)

## Tech Stack

- **SvelteKit** + TypeScript
- **TailwindCSS v4**
- **IndexedDB** (via `idb`)
- **Vercel** adapter for deployment

## Getting Started

### Install & run

```bash
npm install
npm run dev
```

### Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Or connect your GitHub repo for auto-deployments.

## Project Structure

```
src/
├── lib/
│   ├── types.ts          # TypeScript interfaces
│   ├── db.ts             # IndexedDB CRUD operations
│   ├── engine.ts         # Attendance calculation engine
│   ├── stores.ts         # Svelte reactive stores
│   ├── backup.ts         # JSON file download/upload backup
│   └── components/       # Reusable Svelte components
│       ├── StatusCard     # Current status display
│       ├── Calendar       # Monthly grid view
│       ├── DayCell        # Individual day in calendar
│       ├── DayDetailModal # Day details & event actions
│       ├── EventEditor    # Add/edit events
│       ├── EventTimeline  # Chronological event list
│       └── TimePicker     # Date & time selector
├── routes/
│   ├── +layout.svelte    # App shell & navigation
│   ├── +page.svelte      # Dashboard
│   ├── calendar/         # Monthly calendar view
│   ├── history/          # Event timeline
│   └── settings/         # Rules config & backup
static/
├── manifest.json         # PWA manifest
├── sw.js                 # Service worker (cache-first)
├── favicon.svg
└── icons/                # PWA icons (192 & 512)
```

## How Mess Reduction Works

1. Log **LEAVE** / **RETURN** events with timestamps
2. Days where you leave before **Y_time** or return after **Z_time** are marked **full absent**
3. Consecutive full-absent blocks of **X or more days** qualify for **mess reduction**
4. Days with no tracking data show as **No Data** (not falsely marked present)
5. Configure X, Y_time, Z_time in **Settings**

## Backup & Restore

- Go to **Settings → Backup & Restore**
- **Download Backup** — saves all events & settings as a `.json` file
- **Upload Backup** — restore from a previously downloaded backup file
