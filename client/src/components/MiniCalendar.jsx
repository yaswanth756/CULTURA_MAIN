import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// --- Helpers (same as main calendar) ---
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

const normalize = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// --- Mini Calendar ---
export default function MiniCalendar({
  viewMonth,
  setViewMonth,
  selected,
  onPick,
  today,
}) {
  const days = useMemo(() => buildGrid(viewMonth), [viewMonth]);

  return (
    <div className="w-[260px] sm:w-[350px]  h-[250px] rounded-xl border-gray-200 bg-white p-2 sm:p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, -1))}
          className="p-1 rounded-full hover:bg-gray-100"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
        </button>

        <h2 className="text-xs sm:text-sm font-semibold text-gray-900">
          {fmtMonthYear(viewMonth)}
        </h2>

        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="p-1 rounded-full hover:bg-gray-100"
          aria-label="Next month"
        >
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center text-[10px] text-gray-600 mb-1 select-none">
        {weekdayHeader.map((d) => (
          <div
            key={d.full}
            role="columnheader"
            aria-label={d.full}
            className="uppercase tracking-widest h-4 flex items-center justify-center"
          >
            {d.short}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const inMonth = d.getMonth() === viewMonth.getMonth();
          if (!inMonth)
            return <div key={i} className="h-6 w-6 mx-auto" aria-hidden="true" />;

          const selectedDay = selected && sameDay(d, selected);
          const disabled = normalize(d) < normalize(today);
          const todayDay = sameDay(d, today);

          const base =
            "h-6 w-6 mx-auto flex items-center justify-center text-[10px] sm:text-sm rounded-full transition";

          let tone = "text-gray-900 hover:bg-gray-100";
          if (todayDay && !selectedDay) tone = "bg-gray-200 text-black";
          if (selectedDay) tone = "bg-gray-800 text-white";

          const state = disabled ? "opacity-40 cursor-not-allowed" : "";

          return (
            <button
              key={i}
              aria-selected={!!selectedDay}
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
