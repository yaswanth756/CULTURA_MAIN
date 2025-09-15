import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

// Helpers
const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);

const startGrid = (monthDate) => {
  const first = startOfMonth(monthDate);
  const day = first.getDay(); // 0..6 (Sun..Sat)
  return new Date(first.getFullYear(), first.getMonth(), 1 - day);
};

const buildGrid = (monthDate) => {
  const start = startGrid(monthDate);
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
};

const fmtMonthYear = (d) =>
  new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(d);

const fmtDisplay = (d) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);

const parseISO = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const stripTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = "Add dates",
}) {
  const selected = useMemo(() => (value ? parseISO(value) : null), [value]);
  const [open, setOpen] = useState(false);

  const today = stripTime(new Date());
  const [viewMonth, setViewMonth] = useState(
    selected ? startOfMonth(selected) : startOfMonth(today)
  );
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const days = useMemo(() => buildGrid(viewMonth), [viewMonth]);

  const handlePick = (d) => {
    onChange?.(toISO(d));
    setOpen(false);
  };

  const isPast = (d) => stripTime(d) < today; // keep past dates disabled like the mock

  // Weekday header data
  const weekdayHeader = [
    { short: "S", full: "Sunday" },
    { short: "M", full: "Monday" },
    { short: "T", full: "Tuesday" },
    { short: "W", full: "Wednesday" },
    { short: "T", full: "Thursday" },
    { short: "F", full: "Friday" },
    { short: "S", full: "Saturday" },
  ];

  return (
    <div className="relative" ref={ref}>
      {/* Anchor */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Add dates"
        className="inline-flex items-center gap-3 rounded-full  border-gray-200 px-4 py-2 bg-white "
      >
        <CalendarIcon className="w-5 h-5 text-gray-500" />
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected ? fmtDisplay(selected) : placeholder}
        </span>
      </button>

      {/* Popover Calendar */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Choose date"
          className="absolute left-1/2 -translate-x-1/2 z-30 mt-8 w-[450px] rounded-2xl border border-gray-200 bg-white  p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, -1))}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <h2 className="text-base font-semibold text-gray-900" aria-live="polite">
              {fmtMonthYear(viewMonth)}
            </h2>

            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Weekdays (single-letter with airy spacing) */}
          <div role="row" className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2 select-none">
            {weekdayHeader.map((d) => (
              <div
                key={d.full}
                role="columnheader"
                aria-label={d.full}
                className="uppercase tracking-widest h-6 flex items-center justify-center"
              >
                {d.short}
              </div>
            ))}
          </div>

          {/* Days Grid with outside days hidden as blanks */}
          <div role="grid" className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              const inMonth = d.getMonth() === viewMonth.getMonth();

              // Render empty placeholder when not in current month
              if (!inMonth) {
                return (
                  <div
                    key={i}
                    role="gridcell"
                    aria-hidden="true"
                    className="h-9 w-9 mx-auto"
                  />
                );
              }

              const selectedDay = selected && sameDay(d, selected);
              const disabled = isPast(d);
              const base =
                "h-9 w-9 mx-auto flex items-center justify-center text-sm rounded-full transition";
              const tone = selectedDay
                ? "bg-gray-900 text-white"
                : "text-gray-900 hover:bg-gray-100";
              const state = disabled ? "opacity-40" : "";

              return (
                <button
                  key={i}
                  role="gridcell"
                  aria-selected={!!selectedDay}
                  aria-disabled={disabled}
                  disabled={disabled}
                  onClick={() => handlePick(d)}
                  className={`${base} ${tone} ${state}`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
