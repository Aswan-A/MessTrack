# MessTrack — Hostel Attendance & Mess Reduction PWA

A privacy-first, installable, offline-capable PWA for tracking hostel leave and calculating mess reduction days automatically.

## Features

- 🏠 **Track hostel leave** with event-based attendance
- 📊 **Auto-calculate** full-day absences & mess reduction
- 📱 **Offline-first** — works without internet
- 🔐 **Encrypted backup** to your own Google Drive
- ☁️ **Auto-restore** on new devices or after data wipe
- ❌ **No server** — your data stays yours

## Tech Stack

- **SvelteKit** + TypeScript
- **TailwindCSS v4**
- **IndexedDB** (via `idb`)
- **Web Crypto API** (PBKDF2 + AES-GCM)
- **Google Identity Services** + Drive REST API

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable the **Google Drive API**
4. Create an **OAuth 2.0 Client ID** (Web application)
   - Add your origins (e.g., `http://localhost:5173` for dev, your Vercel URL for production)
   - Add redirect URIs as needed
5. Copy the Client ID
6. Replace `YOUR_GOOGLE_CLIENT_ID` in `src/lib/auth.ts`

### 3. Run locally

```bash
npm run dev
```

### 4. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Or connect your GitHub repo to Vercel for auto-deployments.

## Project Structure

```
src/
├── lib/
│   ├── types.ts          # TypeScript interfaces
│   ├── db.ts             # IndexedDB CRUD operations
│   ├── engine.ts         # Attendance calculation engine
│   ├── stores.ts         # Svelte reactive stores
│   ├── auth.ts           # Google OAuth wrapper
│   ├── crypto.ts         # AES-GCM encryption
│   ├── drive.ts          # Google Drive API
│   ├── sync.ts           # Backup/restore orchestrator
│   └── components/       # Reusable Svelte components
├── routes/
│   ├── +layout.svelte    # App shell, auth gate, nav
│   ├── +page.svelte      # Dashboard
│   ├── calendar/         # Monthly calendar view
│   ├── history/          # Event timeline
│   └── settings/         # Config & sync controls
```

## How Mess Reduction Works

1. Log LEAVE/RETURN events with timestamps
2. Days where you leave before **Y_time** or return after **Z_time** are marked **full absent**
3. Consecutive full-absent blocks of **X or more days** qualify for mess reduction
4. Configure X, Y_time, Z_time in Settings
