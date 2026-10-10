import { useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import ClockDial from "./ClockDial";

function shouldUseNativePicker() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return Capacitor.isNativePlatform() || /Android/i.test(ua);
}

function TimeField({ value, onChange, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  function openPicker() {
    if (shouldUseNativePicker()) {
      const el = inputRef.current;
      if (el) {
        try {
          if (typeof el.showPicker === "function") {
            el.showPicker();
            return;
          }
        } catch (error) {
          // fall through to focus
        }
        el.focus();
        return;
      }
    }
    setOpen(true);
  }

  return (
    <>
      <div className="time-field">
        <input
          ref={inputRef}
          type="time"
          className="time-input"
          value={value}
          aria-label={ariaLabel}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="time-open"
          onClick={openPicker}
          aria-label={ariaLabel || "Open time picker"}
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </button>
      </div>

      {open && (
        <ClockDial
          value={value}
          onChange={onChange}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export default TimeField;
