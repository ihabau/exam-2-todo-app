# ToDo App — Exam 2

A **starting point** for the individual exam (Examination 2) of the Folkuniversitet
_Grundläggande Frontend-programmering_ course. You build the app yourself — this folder only gives you
a clean Vite + React scaffold and the requirements as hints.

> **Source:** all requirements come from the course book
> [mu26-frontend-grundkurs](https://github.com/linuszocom/mu26-frontend-grundkurs/blob/main/README.md).
> Read the **vecka-40** week folder in order before you write code:
> [`15-todo-klar-ta-bort`](https://github.com/linuszocom/mu26-frontend-grundkurs/tree/main/vecka-40/15-todo-klar-ta-bort),
> [`16-css-react`](https://github.com/linuszocom/mu26-frontend-grundkurs/tree/main/vecka-40/16-css-react),
> [`17-exam-2-start`](https://github.com/linuszocom/mu26-frontend-grundkurs/tree/main/vecka-40/17-exam-2-start).
> The local reference copy (with English translations) is `frontend/exercises/exam-todo-app/`.

## Getting started

```bash
npm install
npm run dev
```

## Android app version

The `android-app-version` branch wraps this app for Android with **Capacitor**
and reworks the UI into a four-tab layout:

- **Tasks** — the original todo app (add, toggle, edit, delete).
- **Calendar** — a `react-calendar` month grid; tap a day to see its tasks.
- **Schedule** — a day timeline (time slots) plus an "Unscheduled" group.
- **History** — deleted tasks, with restore and clear.

The layout is responsive: bottom tabs on phones, a left navigation rail on
tablets, with safe-area handling for notches and navigation bars.

Native integration (guarded so the browser dev server still works):

- Status bar themed to match the app theme.
- Hardware back button returns to the Tasks tab before exiting.
- Local-notification reminders for scheduled tasks (`dueDate` + `dueTime`).

```bash
npm run build          # build the web app
npx cap sync android   # copy web assets into the Android project
npx cap open android   # open the native project in Android Studio
```

> Reminders only fire on a device/emulator — not in the browser.

## Description

Build a working ToDo app in React. Tasks live in **state** (`useState`), each task is an object with
`{ id, text, done }`, and the list renders with `.map()`. The page must update immediately when data
changes — no page reload.

## Current status

Working:

- [x] **Add a task** — form submits on button or Enter.
- [x] **Block empty input** — `trim()` check.
- [x] **Mark as done / pending** — toggle via `.map()` in `toggleTodo` (checkbox + strikethrough).
- [x] **Delete one task** — `.filter()` by id.
- [x] **No page reload** — all updates go through `setTodos`.
- [x] **Immutable list updates** — spread / `.map()` / `.filter()` on `todos`.
- [x] **English names** — `addTodo`, `removeTodo`, `toggleTodo`, `todos`, `text`.
- [x] **Timestamps** — `timeStart` at creation, `timeEnd` on complete/clear, `timeDeleted` on delete.
- [x] **History** — deleted todos go to a `history` list with a restore button; empty lists are skipped.
      (Note: `history` is a plain module array, not React state — it renders because the delete's
      `setTodos` triggers the re-render. Accepted design choice.)
- [x] **Number on each line** — the task `id` is displayed next to the text.
- [x] **Shopping list** — any task can be a list (`kind: "list"`) with nested items + `amount`;
      checking every item auto-completes the list, and vice versa.
- [x] **Color flags** — pick one of 16 colors for a new task; shown as a colored left edge (also in history).
- [x] **Themes** — dropdown (Slate / Dark / Indigo / Teal / Plum) plus an Auto day/night mode, all
      persisted in `localStorage`.
- [x] **Live clock** in the header.
- [x] **Styling / responsive** — done vs pending looks different; layout adapts down to phones.
- [x] **Edit a task / list item** — inline edit with save/cancel (Enter saves, Escape cancels);
      whitespace-only edits are rejected; the edit button hides on completed rows.
- [x] **Reusable components** — `TodoForm` and `TodoItem` split out of `App` and communicating via
      props (VG requirement).
- [x] **Persistence** — tasks + history are saved to `localStorage`, so they survive closing the app,
      the browser, or the dev server (`todos` via a `useState` initializer, `history` at module scope).

Not built yet:

- (none)

Known issues to fix before submission:

- **Task ids** are assigned with `nextId()` and the active list is renumbered (`renumber()`) after every
  delete, so ids stay `1..n`; restored tasks get a fresh id and move to the end. A deliberate choice —
  be ready to discuss on camera why a real app might prefer a stable, never-reused id instead.
- **`e.target.firstChild.value`** reads the input by position — use the controlled `text` state it is
  already wired to.
- **Strikethrough via `document.querySelector`** does manual DOM work React should do — derive the
  class from `todo.done` instead.
- **`toggleTodo` mutates** the found todo object (`todo.timeEnd = ...`) in place before the `.map()` —
  a new object in the `.map()` is the immutable path.

## Project checklist (what to build)

- [x] **Add a task** — input field + button, or the Enter key.
- [x] **Block empty input** — empty / whitespace-only tasks can't be added.
- [x] **Mark as done** — toggle a single task done ↔ not-done, and back again.
- [x] **Visual difference** — done tasks look clearly different (strikethrough + checkbox).
- [x] **Delete one task** — a delete button that removes only that task.
- [x] **No page reload** — the list re-renders when state changes.
- [x] **Immutable state** — never mutate the array in place; `setTodos` always gets a new array.
      Hints: `.map()` for toggle (new object for the matching id), `.filter()` for delete,
      `id` is not the array index — indices shift when you delete.
- [x] **English names** — components, functions, variables in English (interface text may be anything).

You decide the component structure. For a VG you need **at least two reusable components** beyond
`App` communicating via props (e.g. one for the form/input, one for a single task row).

> 📚 Detailed teaching notes (state, immutable updates, `.map()`/`.filter()`, timestamps, history,
> editing, gotchas): see [`TEACHING.md`](./TEACHING.md). It is gitignored so it stays out of your
> submitted repo.

## Extras you want to add (hints, not code)

Approach each one with the same rule as the core app: **state changes only via `setState` with a new
array/object — never mutate in place.**

### Timestamps on start / completed / deleted + history

- **Start:** give each task its own timestamp set once when it is created. Hint: put it on the task
  object next to `text`/`done`, e.g. a `created`/`startedAt` field holding the time when the task was
  added.
- **Completed:** set a timestamp when a task becomes done, and _clear_ it when toggled back to
  not-done. Hint: the same `.map()` you use to flip `done` can set or remove the `completedAt` value
  on the matching `id` — a new object every time.
- **Deleted:** if you keep a "deleted at" time you probably want a **history**, because a deleted task
  no longer exists in the list. Hint: keep a second piece of state (e.g. `history`) that is a list of
  events — each add / toggle / delete pushes (immutably!) a new entry `{ taskId, action, at }`, and you
  render that list with the same `.map()` pattern as the tasks.
- **Display:** show the timestamps as local time strings (look up how to format a timestamp in JS —
  that's a hint, go read how).

### Number + checklist on every line (shopping-list style)

- **A number per line:** give each line its own number field on the object (or derive the id), and
  show it beside the text. Hint: do **not** use the array index as the number — indices shift when you
  delete a row, the id/number must stay put, same reason the exam requires `id`.
- **Checklist per line:** that is the checkbox you are already building — done toggles with `.map()`.
  Shopping-list extension: also store an amount per row (`{ id, text, amount, done }`) if you want.

### Edit a task

- Add an **Edit** button per row. Hint: track _which_ row is being edited in state (e.g. an
  `editingId`); when that id matches the row, replace the text with an input field.
- On save, update the text with the same immutable `.map()` pattern as toggle — new object for the
  matching id. Validate like the add form: empty / whitespace-only edits get rejected.
- Escape / Cancel should leave state untouched (an easy bug — decide the rule before you code it).

## Exam requirements (GitHub & delivery)

- [x] New **public** repo (not a fork of the course repo): <https://github.com/ihabau/exam-2-todo-app>
- [x] **At least 5 commits** showing the app built up step by step (the exam spec: "Make **at least 5
      commits** showing how the application was built up step by step during development").
- [x] `README.md` filled in — answer sections drafted (see below); rewrite in your own words before
      submitting so you can defend them on camera.
- [x] 3–5 min Teams video; link pasted into section 5 below.

### Left to do before submission

- [x] Re-read the four answer sections and reword them in my own voice (the exam's own-work rule).
- [x] Record the 3–5 min Teams video (demo add / toggle / delete / edit / history).
- [x] Paste the Teams link into **README answer section 5**.
- [x] Confirm the repo is public and the latest `main` is pushed.

### Commit counter (teacher requires ≥5)

Target: **5** commits.

`git log --oneline` count: **6 / 5** — commits made and pushed so far:

- [x] Commit 1 — initial scaffold (Vite + React, git init, pushed) ✓
- [x] Commit 2 — README counter + repo status, pushed ✓
- [x] Commit 3 — correct HTML tags / semantics in JSX (`742d891`) ✓
- [x] Commit 4 — restructure JSX markup for header, form and history (`ae75ce1`) ✓
- [x] Commit 5 — lists, color flags, themes + Auto mode, README update (`8fc1222`) ✓
- [x] Commit 6 — split into `TodoForm`/`TodoItem`, `localStorage` persistence, id renumbering (`57cedeb`) ✓
- [x] Settled on GitHub (pushed after each commit so the history shows step by step) ✓

Repo: <https://github.com/ihabau/exam-2-todo-app>

## README answer sections

### 1. State management — how does the app keep track of the tasks and their done-status, and what happens to the UI when the data updates?

The app keeps every task in the `todos` state array (`useState`) and the current form text in the `text` state. Each task is an object like `{ id, text, done, ... }`, and `editing` / `editText` track which row is being edited. When a handler calls `setTodos(...)` with a new array, React re-renders `App` and `todos.map()` draws a `TodoItem` for each task, with no page reload. The checkbox and strikethrough follow `todo.done`, so the screen always reflects the current state. Deleted tasks move to a separate `history` list, and both `todos` and `history` are saved to `localStorage` so they survive a reload.

### 2. Immutability — why is `.push()` on an existing array forbidden in React? What do you do instead?

React decides whether to re-render by comparing references, so `.push()` is forbidden because it changes the array in place and returns the same reference, meaning React may not notice the change. Instead I always give `setTodos` a brand-new array and make changed items new objects. Adding uses `setTodos([...todos, newTodo])`, deleting uses `todos.filter(...)`, and toggling uses `todos.map(...)` returning a new object for the matching id. This keeps the previous state untouched and makes updates predictable.

### 3. Code review — what is wrong with this snippet, and how would you rewrite it?

```javascript
function addTodo(todos, text) {
  todos.push(text);
  return todos;
}
```

- **What it tries to do:** add a new task to the to-do list.
- **What goes wrong:** Think of React as keeping two frames: frame 1 is the snapshot it saved of the previous state (the arrays) and the HTML that rendered from it, and frame 2 is the new guess after the update. React only compares these two frames by reference, not by reading what is on screen. `todos.push(text)` rewrites the arrays in frame 1 and returns the same array, so `old === new` is true and React thinks the two frames are identical, misses the change, and shows nothing. It also pushes a bare string instead of a task object.
- **A better way:** build and return a new array for frame 2, e.g. `return [...todos, { id: nextId(todos), text, done: false }]`, and pass the result to `setTodos`.

### 4. Reflection — a problem you hit and how you solved it

One problem I hit was a React console warning that an input was changing from uncontrolled to controlled, which happened because the `text` state started as `undefined`. I fixed it by initializing the state with an empty string (`useState("")`). Another issue was position-based task ids: after deleting or restoring rows the ids repeated and React keys clashed, and it got worse once data was saved to `localStorage`. I read the React docs on controlled components and keys, then added a `nextId()` helper and a `renumber()` step so the ids stay unique and listed `1..n`. Using the browser console and the React docs to find both showed me how useful those warnings really are.

### 5. Video link

<https://teams.microsoft.com/l/message/48:notes/1791579515468?context=%7B%22contextType%22%3A%22chat%22%2C%22oid%22%3A%228%3Aorgid%3A58562a1c-7528-4f1a-99d4-425b0521ca29%22%7D>

_Paste the Teams video link here._

## Future updates (shelved)

Not implemented yet — planned for a later iteration.

### Monetization

Ship **two variants** from one codebase: a clean ("pro") build and a monetized
("free") build. Planned approach:

- **Google AdMob**, not AdSense. AdSense is for websites; an app monetized inside
  a WebView needs AdMob (the Google Mobile Ads SDK). Use the community plugin
  `@capacitor-community/admob` (v8 for Capacitor 8).
- **Non-intrusive placement**: a single adaptive **bottom banner** only — no
  interstitial, app-open, or forced-rewarded ads. The banner draws on the native
  layer above the WebView, so the tab bar must be raised by the banner height
  (via `BannerAdPluginEvents.SizeChanged` → a `--ad-height` CSS variable).
- **Two flavors**: a Vite flag (`VITE_MONETIZE`) plus Android product flavors
  (`free` = ads + AdMob `APPLICATION_ID`, `pro` = no ads), producing two
  installable apps side by side.
- **Consent**: use the plugin's UMP consent APIs (`requestConsentInfo` /
  `showConsentForm`) before requesting ads; test with Google's official test
  unit IDs until real AdMob IDs exist.
- **Optional extras**: a one-time "Remove ads" in-app purchase, or a donation
  link (Ko-fi / Buy Me a Coffee / GitHub Sponsors via `@capacitor/browser`) —
  both zero-ad and non-intrusive.

## Reference

- Course book README: <https://github.com/linuszocom/mu26-frontend-grundkurs/blob/main/README.md>
- Exam spec (English): `frontend/exercises/exam-todo-app/ToDoAppen.en.md`
