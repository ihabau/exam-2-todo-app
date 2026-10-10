import { useEffect, useState } from "react";

const CX = 110;
const CY = 110;
const R_OUT = 86;
const R_IN = 54;
const R_MIN = 82;

const AM_VALUES = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const PM_VALUES = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const MINUTE_LABELS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function pad(n) {
  return String(n).padStart(2, "0");
}

function polar(index, radius) {
  const angle = (index * 30 - 90) * (Math.PI / 180);
  return { x: CX + radius * Math.cos(angle), y: CY + radius * Math.sin(angle) };
}

function ClockDial({ value, onChange, onClose }) {
  const [mode, setMode] = useState("hour");

  const [hh, mm] = value ? value.split(":").map(Number) : [9, 0];
  const isPM = hh === 0 || hh >= 13;
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function pickHour(hour) {
    onChange(`${pad(hour)}:${pad(mm)}`);
    setMode("minute");
  }

  function setMinute(minute) {
    onChange(`${pad(hh)}:${pad(minute)}`);
  }

  function setPeriod(pm) {
    let num = hh % 12;
    if (num === 0) num = 12;
    const next = pm ? (num === 12 ? 0 : num + 12) : num;
    onChange(`${pad(next)}:${pad(mm)}`);
  }

  let handIndex;
  let handRadius;
  if (mode === "hour") {
    if (hh === 0) {
      handIndex = 0;
      handRadius = R_OUT;
    } else if (hh >= 13) {
      handIndex = hh - 12;
      handRadius = R_OUT;
    } else if (hh === 12) {
      handIndex = 0;
      handRadius = R_IN;
    } else {
      handIndex = hh;
      handRadius = R_IN;
    }
  } else {
    handIndex = Math.floor(mm / 5);
    handRadius = R_MIN;
  }
  const hand = polar(handIndex, handRadius);

  return (
    <div className="clock-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="clock-panel" onClick={(e) => e.stopPropagation()}>
        <div className="clock-header">
          <button
            type="button"
            className={"clock-mode" + (mode === "hour" ? " active" : "")}
            onClick={() => setMode("hour")}
          >
            {pad(hour12)}
          </button>
          <span className="clock-colon">:</span>
          <button
            type="button"
            className={"clock-mode" + (mode === "minute" ? " active" : "")}
            onClick={() => setMode("minute")}
          >
            {pad(mm)}
          </button>
          <div className="clock-period">
            <button
              type="button"
              className={!isPM ? "active" : ""}
              onClick={() => setPeriod(false)}
            >
              AM
            </button>
            <button
              type="button"
              className={isPM ? "active" : ""}
              onClick={() => setPeriod(true)}
            >
              PM
            </button>
          </div>
        </div>

        <svg className="clock-dial" viewBox="0 0 220 220">
          <line className="clock-hand" x1={CX} y1={CY} x2={hand.x} y2={hand.y} />

          {mode === "hour" && (
            <>
              {AM_VALUES.map((value, i) => {
                const p = polar(i, R_IN);
                return (
                  <g
                    key={"am" + value}
                    className={"clock-num inner" + (hh === value ? " selected" : "")}
                    onClick={() => pickHour(value)}
                  >
                    <circle className="clock-num-bg" cx={p.x} cy={p.y} r="14" />
                    <text
                      className="clock-num-text"
                      x={p.x}
                      y={p.y}
                      dominantBaseline="central"
                      textAnchor="middle"
                    >
                      {pad(value)}
                    </text>
                  </g>
                );
              })}

              {PM_VALUES.map((value, i) => {
                const p = polar(i, R_OUT);
                return (
                  <g
                    key={"pm" + value}
                    className={"clock-num outer" + (hh === value ? " selected" : "")}
                    onClick={() => pickHour(value)}
                  >
                    <circle className="clock-num-bg" cx={p.x} cy={p.y} r="16" />
                    <text
                      className="clock-num-text"
                      x={p.x}
                      y={p.y}
                      dominantBaseline="central"
                      textAnchor="middle"
                    >
                      {value === 0 ? "00" : pad(value)}
                    </text>
                  </g>
                );
              })}
            </>
          )}

          {mode === "minute" &&
            MINUTE_LABELS.map((label, i) => {
              const p = polar(i, R_MIN);
              return (
                <g
                  key={label}
                  className={
                    "clock-num" + (Math.floor(mm / 5) === i ? " selected" : "")
                  }
                  onClick={() => setMinute(label)}
                >
                  <circle className="clock-num-bg" cx={p.x} cy={p.y} r="16" />
                  <text
                    className="clock-num-text"
                    x={p.x}
                    y={p.y}
                    dominantBaseline="central"
                    textAnchor="middle"
                  >
                    {pad(label)}
                  </text>
                </g>
              );
            })}

          <circle className="clock-center" cx={CX} cy={CY} r="4" />
        </svg>

        <div className="clock-actions">
          <button
            type="button"
            className="ghost"
            onClick={() => {
              onChange("");
              onClose();
            }}
          >
            Clear
          </button>
          <button type="button" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClockDial;
