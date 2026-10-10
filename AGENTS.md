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
  `@capacitor/local-notifications`.
- Native calls are guarded with `Capacitor.isNativePlatform()` so the browser
  dev server does not break.
- Notifications only fire on a device/emulator, not in the browser.
- After changing web assets, run `npm run build` then `npx cap sync android`.

## Shelved / future work

- Monetization (AdMob bottom banner, a no-ads "pro" flavor, optional
  "remove ads" IAP or donation link) — see README "Future updates". Do not
  implement until requested.
