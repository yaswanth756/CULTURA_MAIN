// BookingFilters.jsx - WITHOUT COUNT BADGES
import React from 'react';

const filters = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "cancelled", label: "Cancelled" },
  { key: "completed", label: "Completed" },
];

const BookingFilters = ({ activeFilter, onFilterChange, countFor }) => {
  return (
    <div className="mb-3 sm:mb-4" data-aos="fade-up" data-aos-delay="60">
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {filters.map((f) => {
          const active = activeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`rounded-full flex px-3 sm:px-5 py-2 sm:py-2.5 min-h-[40px] sm:min-h-[44px] text-xs sm:text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap border font-medium items-center ${
                active 
                  ? "bg-gray-900 text-white border-gray-900" 
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BookingFilters;
