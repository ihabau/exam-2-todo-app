# AGENTS.md

Guidance for agents working in this repo (the `android-app-version` branch).

## What this is

A Vite + React ToDo app wrapped as an Android app with **Capacitor**. The `main`
branch is the original exam submission; `android-app-version` adds a tabbed
Android UI (Tasks / Calendar / Schedule) plus native integration.

## Commands

```bash
npm install                 # install deps
npm run dev                 # Vite dev server (browser; native APIs no-op)
npm run build               # build web app to dist/
npx cap sync android        # copy dist/ + plugins into the android/ project
npx cap open android        # open the native project in Android Studio
npx wrangler pages deploy dist   # (future) deploy the web build to Cloudflare Pages
```

There is **no test runner and no linter** configured. Verify changes with
`npm run build` (must pass) and by running the app.

## Architecture

- `src/App.jsx` — shell: owns all shared state and handlers, renders the active
  view + `TabBar`.
- `src/views/TasksView.jsx` — the original todo UI (form + active list).
- `src/views/CalendarView.jsx` — `react-calendar` month grid + selected-day list.
- `src/views/ScheduleView.jsx` — day timeline with time slots + unscheduled group.
- `src/views/HistoryView.jsx` — deleted tasks with restore/clear.
- `src/components/TabBar.jsx` — bottom tabs (phones) / left rail (tablets).
- `src/components/TodoForm.jsx`, `TodoItem.jsx` — reusable task components.
- `src/utils/date.js` — date helpers (`toDateKey`, `tasksForDay`, `formatWhen`, …).
- `src/utils/notifications.js` — Capacitor local-notification reminders.
- `src/utils/export.js` — CSV export/import (papaparse). Export is delivered via
  `@capacitor/filesystem` + `@capacitor/share` on device, Blob download in the browser;
  import reads a picked `.csv` through a hidden `<input type="file">` (native file
  chooser works in the WebView). Import assigns fresh ids and does not restore `repeat`.
- `src/index.css` — all styling (CSS variables for themes, `@media` for layout).

## Conventions

- **State updates must be immutable** — always give `setTodos` a new array/object
  (`.map()` / `.filter()` / spread). Never mutate in place.
- Function/component/variable names in English. No comments unless asked.
- Tasks are objects: `{ id, text, done, timeStart, timeEnd, timeDeleted, color,
  dueDate, dueTime, remind }`. `kind: "list"` adds `items`. `dueDate` is
  `"YYYY-MM-DD"`, `dueTime` is `"HH:MM"`, both may be `""`.
- Themes are driven by `data-theme` on `<html>` and CSS variables in `index.css`.
- Persistence is `localStorage` (`todos`, `history`, `theme`, `activeTheme`,
  `activeTab`).

## Native / Android notes

- Capacitor 8. Plugins: `@capacitor/status-bar`, `@capacitor/app`,
  `@capacitor/local-notifications`, `@capacitor/filesystem`, `@capacitor/share`.
- Native calls are guarded with `Capacitor.isNativePlatform()` so the browser
  dev server does not break.
- Notifications only fire on a device/emulator, not in the browser.
- After changing web assets, run `npm run build` then `npx cap sync android`.

## Shelved / future work

Do not implement until requested. Full plan mirrored in README "Future updates".
Rollout is **web-first** (Cloudflare Pages), then the existing Capacitor Android shell.

### Hosting (web)

- Frontend = Vite build → **Cloudflare Pages** (static assets, unlimited bandwidth,
  free). Not GitHub Pages (100 GB/mo soft cap; no server functions).
- Build with `npm run build` (output `dist/`), then deploy `dist/`.

### Backend / database (chosen: Cloudflare-native)

- **Cloudflare-native:** Pages + **Workers** + **D1** (SQLite SQL; free 5 GB total /
  500 MB per DB; 5M row-reads + 100k row-writes/day) + **Hyperdrive** as the escape
  hatch to an external Postgres. Workers free = 100k req/day, 10 ms CPU; Workers Paid
  ($5/mo) removes the caps.
- D1 is already SQL; a later move to Postgres/MySQL is a schema + config change if we
  keep **all DB access in one module** and use **Drizzle ORM** (supports both). Data
  portability: `npx wrangler d1 export <db> --output dump.sql`.
- Alternatives (not chosen): Supabase (Postgres + Auth + RLS + Realtime; free 500 MB,
  pauses after 7 days idle, Pro $25/mo → 8 GB) or Firebase/Firestore (1 GiB free, NoSQL,
  daily 50k reads / 20k writes caps).

### Auth

- **Firebase Auth** (free): "Continue with Google" **or** **username + password**
  (the username maps to `username@users.<domain>` internally, so no email is required).
  Workers verify the Firebase ID token; the token `sub` is the user id.
- Alternative (not chosen): custom username/password in a Worker + D1 — true
  username-only but more security surface to own (hashing, reset, rate limiting).
- Never ship DB credentials or privileged keys in the client bundle.

### Credits economy

- Virtual currency earned by watching **optional rewarded video** ads (and/or a daily
  bonus) and **spent on cloud upload/download** of lists & schedules, plus optional
  cosmetics (themes). Naming candidates: **Coins / Crystals / Gems / Sparks / Stones /
  Stars** (undecided).
- **Server-authoritative:** the balance lives in D1; the client may never grant itself
  credits. Grant only via **AdMob server-side verification (SSV)** → a Worker. Ensure
  authenticated users cannot UPDATE their own balance row.

### Sharing (family / friends)

- `shares(owner_id, guest_id)` link table; queries return rows owned by me OR shared
  with me. Kept SQL-relational so the join stays simple.

### Monetization

- **Web:** Google AdSense (allowed on websites).
- **Android:** Google AdMob via `@capacitor-community/admob` (v8 line for Capacitor 8).
  Non-intrusive only: a single adaptive **bottom banner** plus an **optional rewarded
  video** — no interstitial, app-open, or forced-rewarded ads. Consent-first with the
  plugin's UMP APIs (`requestConsentInfo` / `showConsentForm`). The banner draws on the
  native layer above the WebView, so raise the tab bar by the banner height
  (`BannerAdPluginEvents.SizeChanged` → a `--ad-height` CSS variable).
- Ship **two variants** from one codebase later: a clean "pro" build and a monetized
  "free" build — a Vite flag (`VITE_MONETIZE`) plus Android product flavors (`free` =
  ads + AdMob `APPLICATION_ID`, `pro` = no ads).
- **Optional extras**: a one-time "Remove ads" in-app purchase (Play Billing), or a
  donation link (Ko-fi / Buy Me a Coffee / GitHub Sponsors via `@capacitor/browser`).
- Text-only tasks are confirmed — no file/image attachments, so no R2/Storage needed.

### Security rules (must hold when built)

- Credit balances server-authoritative; rewarded credits only via SSV.
- No secrets/API keys in the web bundle; privileged calls go through Workers.
- Guard all native/ad code with `Capacitor.isNativePlatform()`.
