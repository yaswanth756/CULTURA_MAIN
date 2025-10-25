// src/vendor/components/BookingsFilters.jsx
import React from 'react';
import { Search, Loader2, Download, Clock, CheckCircle, CalendarDays, XCircle } from 'lucide-react';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'New', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'completed', label: 'Done', icon: CalendarDays },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle },
];

const BookingsFilters = ({ 
  activeTab, 
  setActiveTab, 
  counts, 
  query, 
  setQuery, 
  onRefresh, 
  isLoading 
}) => {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Bookings</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage and track all bookings</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <Loader2 className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Tabs - Horizontal scroll on mobile */}
      <div className="overflow-x-auto scrollbar-hide -mx-1">
        <div className="flex items-center gap-2 px-1 pb-1 min-w-max">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key;
            const count = counts[key] ?? 0;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  active 
                    ? 'bg-anzac-500 text-white shadow-md scale-105' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {Icon && <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
                <span>{label}</span>
                <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-bold ${
                  active ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 sm:pl-11 pr-4 py-2.5 rounded-full border border-gray-300 focus:ring-2 focus:ring-anzac-500/20 focus:border-anzac-500 outline-none placeholder:text-gray-400 text-sm transition-shadow"
          placeholder="Search bookings..."
        />
      </div>
    </div>
  );
};

export default BookingsFilters;
