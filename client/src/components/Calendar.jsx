import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// --- Helpers ---
const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);

const startGrid = (monthDate) => {
  const first = startOfMonth(monthDate);
  const day = first.getDay();
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

const weekdayHeader = [
  { short: "S", full: "Sunday" },
  { short: "M", full: "Monday" },
  { short: "T", full: "Tuesday" },
  { short: "W", full: "Wednesday" },
  { short: "T", full: "Thursday" },
  { short: "F", full: "Friday" },
  { short: "S", full: "Saturday" },
];

// --- normalize date to midnight (fix for today issue) ---
const normalize = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export default function Calendar({
  viewMonth,
  setViewMonth,
  selected,
  onPick,
  today,
}) {
  const days = useMemo(() => buildGrid(viewMonth), [viewMonth]);

  return (
    <div className="w-[320px] sm:w-[450px] rounded-2xl border border-gray-200 bg-white p-4 sm:p-8 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, -1))}
          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
        </button>

        <h2
          className="text-sm sm:text-base font-semibold text-gray-900"
          aria-live="polite"
        >
          {fmtMonthYear(viewMonth)}
        </h2>

        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
        </button>
      </div>

      {/* Weekdays */}
      <div
        role="row"
        className="grid grid-cols-7 text-center text-xs text-gray-400 mb-1 sm:mb-2 select-none"
      >
        {weekdayHeader.map((d) => (
          <div
            key={d.full}
            role="columnheader"
            aria-label={d.full}
            className="uppercase tracking-widest h-5 sm:h-6 flex items-center justify-center"
          >
            {d.short}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div role="grid" className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {days.map((d, i) => {
          const inMonth = d.getMonth() === viewMonth.getMonth();
          if (!inMonth) {
            return (
              <div
                key={i}
                role="gridcell"
                aria-hidden="true"
                className="h-8 w-8 sm:h-9 sm:w-9 mx-auto"
              />
            );
          }

          const selectedDay = selected && sameDay(d, selected);
          const disabled = normalize(d) < normalize(today);
          const todayDay = sameDay(d, today);

          const base =
            "h-8 w-8 sm:h-9 sm:w-9 mx-auto flex items-center justify-center text-xs sm:text-sm rounded-full transition";

          let tone = "text-gray-900 hover:bg-gray-100";
          if (todayDay && !selectedDay) tone = "bg-gray-200 text-black"; // today highlight
          if (selectedDay) tone = "bg-gray-800 text-white"; // selected

          const state = disabled ? "opacity-40 cursor-not-allowed" : "";

          return (
            <button
              key={i}
              role="gridcell"
              aria-selected={!!selectedDay}
              aria-disabled={disabled}
              disabled={disabled}
              onClick={() => !disabled && onPick(d)}
              className={`${base} ${tone} ${state}`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
