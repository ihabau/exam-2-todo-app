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

## Description

Build a working ToDo app in React. Tasks live in **state** (`useState`), each task is an object with
`{ id, text, done }`, and the list renders with `.map()`. The page must update immediately when data
changes — no page reload.

## Current status

Working so far:

- [x] **Add a task** — form submits on button or Enter.
- [x] **Block empty input** — `trim()` check.
- [x] **Mark as done / pending** — toggle via `.map()` in `toggleTodo`.
- [x] **Delete one task** — `.filter()` by id.
- [x] **No page reload** — all updates go through `setTodos`.
- [x] **Immutable state** — spread / `.map()` / `.filter()`, no `.push()`.
- [x] **English names** — `addTodo`, `removeTodo`, `toggleTodo`, `todos`, `text`.
- [x] **Timestamp when created** — `timeStart` on each task.

Not built yet:

- [ ] History of added / completed / deleted events.
- [ ] Number (or stable id) displayed on every line.
- [ ] Shopping-list `amount` per line.
- [ ] Edit a task.
- [ ] Split into reusable components (`TodoForm`, `TodoItem`) — needed for VG.
- [ ] Styling / visual done- vs pending-difference via CSS classes.

Known issues to fix before submission:

- **`id: todos.length + 1`** is a position, not a stable id — deleting the last row can reuse an id
  and break React `key`s. Generate a fresh id per task instead.
- **`e.target.firstChild.value`** reads the input by position — use the controlled `text` state it is
  already wired to.
- **Strikethrough via `document.querySelector`** does manual DOM work React should do — derive the
  class from `todo.done` instead.

## Project checklist (what to build)

- [x] **Add a task** — input field + button, or the Enter key.
- [x] **Block empty input** — empty / whitespace-only tasks can't be added.
- [x] **Mark as done** — toggle a single task done ↔ not-done, and back again.
- [ ] **Visual difference** — done tasks look clearly different (strikethrough, muted colour, whatever).
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
- **Completed:** set a timestamp when a task becomes done, and *clear* it when toggled back to
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

- Add an **Edit** button per row. Hint: track *which* row is being edited in state (e.g. an
  `editingId`); when that id matches the row, replace the text with an input field.
- On save, update the text with the same immutable `.map()` pattern as toggle — new object for the
  matching id. Validate like the add form: empty / whitespace-only edits get rejected.
- Escape / Cancel should leave state untouched (an easy bug — decide the rule before you code it).

## Exam requirements (GitHub & delivery)

- [x] New **public** repo (not a fork of the course repo): <https://github.com/ihabau/exam-2-todo-app>
- [ ] **At least 5 commits** showing the app built up step by step (the exam spec: "Make **at least 5
      commits** showing how the application was built up step by step during development").
- [ ] `README.md` filled in — in your own words.
- [ ] 3–5 min Teams video; link pasted into the README.

### Commit counter (teacher requires ≥5)

Target: **5** commits.

`git log --oneline` count: **1 / 5** — commits made and pushed so far:
[`66b8815`](https://github.com/ihabau/exam-2-todo-app/commit/66b8815) · repo:
<https://github.com/ihabau/exam-2-todo-app>

- [x] Commit 1 — initial scaffold (Vite + React, git init, pushed) ✓
- [ ] Commit 2 — add form (add task, block empty)
- [ ] Commit 3 — toggle done / pending
- [ ] Commit 4 — delete task
- [ ] Commit 5 — extras (history, timestamps, edit) + README
- [ ] Settled on GitHub (push after each commit so the history shows step by step)

## README sections you must fill in yourself

1. **State management** — how does the app keep track of the tasks and their done-status, and what
   happens to the UI when the data updates? (2–4 sentences)
2. **Immutability** — why is `.push()` on an existing array forbidden in React? What do you do instead?
   (2–4 sentences)
3. **Code review** — explain what is wrong with this snippet and how to rewrite it (use the Code
   Detective template: what it tries to do / what goes wrong / a better way):

   ```javascript
   function addTodo(todos, text) {
     todos.push(text);
     return todos;
   }
   ```

4. **Reflection** — 3–5 sentences on a problem you hit and how you solved it (AI/Google/React docs).
5. **Video link** — paste the Teams link.

Keep every answer in your own words so you can explain it on camera — that is the VG bar.

## Reference

- Course book README: <https://github.com/linuszocom/mu26-frontend-grundkurs/blob/main/README.md>
- Exam spec (English): `frontend/exercises/exam-todo-app/ToDoAppen.en.md`