import { useId } from "react";
import { dateFromKey, toDateKey, WEEKDAY_FULL } from "../utils/date";

const WEEKDAY_ORDER = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAY_SHORT = ["S", "M", "T", "W", "T", "F", "S"];
const NTH_OPTIONS = [
  { value: 1, label: "first" },
  { value: 2, label: "second" },
  { value: 3, label: "third" },
  { value: 4, label: "fourth" },
  { value: -1, label: "last" },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || min));
}

function RepeatField({ value, dueDate, onChange }) {
  const repeat = value && value.freq ? value : null;
  const base = dateFromKey(dueDate) || new Date();
  const radioName = useId();

  function modeOf() {
    if (!repeat) return "none";
    if (repeat.custom) return "custom";
    if ((Number(repeat.interval) || 1) === 1) {
      if (repeat.freq === "daily") return "daily";
      if (repeat.freq === "weekly") return "weekly";
      if (repeat.freq === "monthly") return "monthly";
    }
    return "custom";
  }

  function patch(changes) {
    onChange({ ...repeat, ...changes });
  }

  function changeMode(mode) {
    const until = repeat ? repeat.until || "" : "";
    if (mode === "none") return onChange(null);
    if (mode === "daily") {
      return onChange({ freq: "daily", interval: 1, custom: false, until });
    }
    if (mode === "weekly") {
      return onChange({
        freq: "weekly",
        interval: 1,
        custom: false,
        weekdays: [base.getDay()],
        until,
      });
    }
    if (mode === "monthly") {
      return onChange({
        freq: "monthly",
        interval: 1,
        custom: false,
        monthMode: "date",
        monthDay: base.getDate(),
        until,
      });
    }
    onChange({
      freq: repeat ? repeat.freq : "daily",
      interval: repeat ? repeat.interval || 1 : 1,
      custom: true,
      weekdays: repeat && repeat.weekdays ? repeat.weekdays : [base.getDay()],
      monthMode: repeat ? repeat.monthMode || "date" : "date",
      monthDay: repeat ? repeat.monthDay || base.getDate() : base.getDate(),
      nth: repeat ? repeat.nth || 1 : 1,
      weekday: repeat && repeat.weekday != null ? repeat.weekday : base.getDay(),
      until,
    });
  }

  function toggleWeekday(day) {
    const current = repeat.weekdays || [];
    let next = current.includes(day)
      ? current.filter((item) => item !== day)
      : [...current, day];
    if (next.length === 0) next = current;
    patch({ weekdays: next, custom: true });
  }

  return (
    <div className="repeat-field">
      <label className="field">
        <span className="field-label">
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M17 2l4 4-4 4" />
            <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
            <path d="M7 22l-4-4 4-4" />
            <path d="M21 13v1a4 4 0 0 1-4 4H3" />
          </svg>
          Repeat
        </span>
        <select
          className="repeat-select"
          value={modeOf()}
          onChange={(e) => changeMode(e.target.value)}
        >
          <option value="none">Does not repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="custom">Custom…</option>
        </select>
      </label>

      {repeat && (
        <div className="repeat-panel">
          <div className="repeat-row">
            <span>Every</span>
            <input
              type="number"
              min="1"
              max="99"
              value={repeat.interval || 1}
              onChange={(e) =>
                patch({
                  interval: clamp(e.target.value, 1, 99),
                  custom: true,
                })
              }
            />
            <select
              value={repeat.freq}
              onChange={(e) => patch({ freq: e.target.value, custom: true })}
            >
              <option value="daily">day(s)</option>
              <option value="weekly">week(s)</option>
              <option value="monthly">month(s)</option>
            </select>
          </div>

          {repeat.freq === "weekly" && (
            <div className="repeat-weekdays">
              {WEEKDAY_ORDER.map((day) => (
                <button
                  type="button"
                  key={day}
                  title={WEEKDAY_FULL[day]}
                  className={
                    "weekday-chip" +
                    ((repeat.weekdays || []).includes(day) ? " active" : "")
                  }
                  aria-pressed={(repeat.weekdays || []).includes(day)}
                  onClick={() => toggleWeekday(day)}
                >
                  {WEEKDAY_SHORT[day]}
                </button>
              ))}
            </div>
          )}

          {repeat.freq === "monthly" && (
            <div className="repeat-monthly">
              <label className="repeat-option">
                <input
                  type="radio"
                  name={radioName}
                  checked={repeat.monthMode !== "weekday"}
                  onChange={() => patch({ monthMode: "date", custom: true })}
                />
                <span>On day</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={repeat.monthDay || 1}
                  onChange={(e) =>
                    patch({
                      monthDay: clamp(e.target.value, 1, 31),
                      monthMode: "date",
                      custom: true,
                    })
                  }
                />
              </label>
              <label className="repeat-option">
                <input
                  type="radio"
                  name={radioName}
                  checked={repeat.monthMode === "weekday"}
                  onChange={() => patch({ monthMode: "weekday", custom: true })}
                />
                <span>On the</span>
                <select
                  value={repeat.nth || 1}
                  onChange={(e) =>
                    patch({
                      nth: Number(e.target.value),
                      monthMode: "weekday",
                      custom: true,
                    })
                  }
                >
                  {NTH_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={repeat.weekday != null ? repeat.weekday : 0}
                  onChange={(e) =>
                    patch({
                      weekday: Number(e.target.value),
                      monthMode: "weekday",
                      custom: true,
                    })
                  }
                >
                  {WEEKDAY_ORDER.map((day) => (
                    <option key={day} value={day}>
                      {WEEKDAY_FULL[day]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <label className="repeat-ends">
            <input
              type="checkbox"
              checked={Boolean(repeat.until)}
              onChange={(e) =>
                patch({
                  until: e.target.checked
                    ? dueDate || toDateKey(new Date())
                    : "",
                })
              }
            />
            <span>Ends on</span>
            {repeat.until && (
              <input
                type="date"
                value={repeat.until}
                onChange={(e) => patch({ until: e.target.value })}
              />
            )}
          </label>
        </div>
      )}
    </div>
  );
}

export default RepeatField;
