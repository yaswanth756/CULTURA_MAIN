import React from 'react';

const filters = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const BookingFilters = ({ activeFilter, onFilterChange, countFor }) => {
  return (
    <div className="mb-4" data-aos="fade-up" data-aos-delay="60">
      <div className="inline-flex rounded-full border bg-white p-1 shadow-sm">
        {filters.map((f) => {
          const active = activeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <span>{f.label}</span>
                <span
                  className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] ${
                    active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {countFor(f.key)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BookingFilters;
