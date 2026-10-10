export function pad(n) {
  return String(n).padStart(2, "0");
}

export function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayKey() {
  return toDateKey(new Date());
}

export function dateFromKey(key) {
  if (!key) return null;
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function hasSchedule(todo) {
  return Boolean(todo.dueDate);
}

export function taskDate(todo) {
  return dateFromKey(todo.dueDate);
}

export function tasksForDay(todos, dateKey) {
  return todos
    .filter((todo) => occursOn(todo, dateKey))
    .map((todo) => occurrenceFor(todo, dateKey))
    .sort(byTimeThenText);
}

export function unscheduled(todos) {
  return todos.filter((todo) => !todo.dueDate);
}

export function byTimeThenText(a, b) {
  const at = a.dueTime || "99:99";
  const bt = b.dueTime || "99:99";
  if (at !== bt) return at < bt ? -1 : 1;
  return a.text.localeCompare(b.text);
}

export function sortByWhen(todos) {
  return [...todos].sort((a, b) => {
    const ad = a.dueDate || "9999-99-99";
    const bd = b.dueDate || "9999-99-99";
    if (ad !== bd) return ad < bd ? -1 : 1;
    return byTimeThenText(a, b);
  });
}

export function formatWhen(todo) {
  if (!todo.dueDate) return "No date";
  const date = dateFromKey(todo.dueDate);
  const label = date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return todo.dueTime ? `${label} · ${todo.dueTime}` : label;
}

export function normalizeTimeInput(value) {
  if (!value) return "";
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return "";
  const h = Math.min(23, Math.max(0, Number(match[1])));
  const m = Math.min(59, Math.max(0, Number(match[2])));
  return `${pad(h)}:${pad(m)}`;
}

/* ---------- Recurrence ---------- */

const DAY_MS = 24 * 60 * 60 * 1000;
export const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAY_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const ORDINALS = {
  1: "first",
  2: "second",
  3: "third",
  4: "fourth",
  5: "fifth",
  "-1": "last",
};

function startOfWeek(date) {
  const day = startOfDay(date);
  day.setDate(day.getDate() - day.getDay());
  return day;
}

export function daysBetween(from, to) {
  return Math.round((startOfDay(to) - startOfDay(from)) / DAY_MS);
}

export function isRecurring(todo) {
  return Boolean(todo.repeat && todo.repeat.freq);
}

export function occursOn(todo, dateKey) {
  if (!isRecurring(todo)) return todo.dueDate === dateKey;
  const start = dateFromKey(todo.dueDate);
  const date = dateFromKey(dateKey);
  if (!start || !date) return false;
  if (date < start) return false;
  if (todo.repeat.until && dateKey > todo.repeat.until) return false;
  const interval = Math.max(1, Number(todo.repeat.interval) || 1);

  if (todo.repeat.freq === "daily") {
    return daysBetween(start, date) % interval === 0;
  }

  if (todo.repeat.freq === "weekly") {
    const weekdays =
      todo.repeat.weekdays && todo.repeat.weekdays.length
        ? todo.repeat.weekdays
        : [start.getDay()];
    if (!weekdays.includes(date.getDay())) return false;
    const weeks = Math.round(
      (startOfWeek(date) - startOfWeek(start)) / (7 * DAY_MS),
    );
    return weeks % interval === 0;
  }

  if (todo.repeat.freq === "monthly") {
    const months =
      (date.getFullYear() - start.getFullYear()) * 12 +
      (date.getMonth() - start.getMonth());
    if (months < 0 || months % interval !== 0) return false;

    if (todo.repeat.monthMode === "weekday") {
      const weekday =
        todo.repeat.weekday != null ? todo.repeat.weekday : start.getDay();
      if (date.getDay() !== weekday) return false;
      const nth = todo.repeat.nth || 1;
      if (nth === -1) {
        const lastDay = new Date(
          date.getFullYear(),
          date.getMonth() + 1,
          0,
        ).getDate();
        return date.getDate() + 7 > lastDay;
      }
      const occurrence = Math.floor((date.getDate() - 1) / 7) + 1;
      return occurrence === nth;
    }

    const day = todo.repeat.monthDay || start.getDate();
    return date.getDate() === day;
  }

  return false;
}

export function isCompleted(todo, dateKey) {
  if (!isRecurring(todo)) return Boolean(todo.done);
  return (todo.completedDates || []).includes(dateKey);
}

export function occurrenceFor(todo, dateKey) {
  return {
    ...todo,
    seriesStart: todo.dueDate,
    dueDate: dateKey,
    occurrenceDate: dateKey,
    done: isCompleted(todo, dateKey),
  };
}

export function nextOccurrence(todo, fromDate) {
  const from = startOfDay(fromDate);
  for (let i = 0; i < 366 * 6; i++) {
    const key = toDateKey(addDays(from, i));
    if (occursOn(todo, key)) return dateFromKey(key);
  }
  return null;
}

export function nextOccurrences(todo, fromDate, count) {
  const result = [];
  const from = startOfDay(fromDate);
  for (let i = 0; i < 366 * 6 && result.length < count; i++) {
    const key = toDateKey(addDays(from, i));
    if (occursOn(todo, key)) result.push(dateFromKey(key));
  }
  return result;
}

export function formatRepeat(todo) {
  if (!isRecurring(todo)) return "";
  const interval = Math.max(1, Number(todo.repeat.interval) || 1);
  let text = "";

  if (todo.repeat.freq === "daily") {
    text = interval === 1 ? "Daily" : `Every ${interval} days`;
  } else if (todo.repeat.freq === "weekly") {
    const weekdays = todo.repeat.weekdays || [];
    const names = [...weekdays]
      .sort((a, b) => a - b)
      .map((day) => WEEKDAY_NAMES[day])
      .join(", ");
    if (interval === 1) text = names ? `Weekly on ${names}` : "Weekly";
    else
      text = names
        ? `Every ${interval} weeks on ${names}`
        : `Every ${interval} weeks`;
  } else if (todo.repeat.freq === "monthly") {
    if (todo.repeat.monthMode === "weekday") {
      const nth = ORDINALS[todo.repeat.nth || 1] || "first";
      const weekday =
        WEEKDAY_FULL[todo.repeat.weekday != null ? todo.repeat.weekday : 0];
      text =
        interval === 1
          ? `Monthly on the ${nth} ${weekday}`
          : `Every ${interval} months on the ${nth} ${weekday}`;
    } else {
      const day =
        todo.repeat.monthDay ||
        (todo.dueDate ? dateFromKey(todo.dueDate).getDate() : 1);
      text =
        interval === 1
          ? `Monthly on day ${day}`
          : `Every ${interval} months on day ${day}`;
    }
  }

  if (todo.repeat.until) {
    const until = dateFromKey(todo.repeat.until);
    if (until) text += `, until ${until.toLocaleDateString()}`;
  }
  return text;
}
