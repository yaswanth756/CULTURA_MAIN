// src/vendor/pages/BookingsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { buildApiUrl } from '../../utils/api';
import PendingNotice from '../components/PendingNotice';
import BookingCard from '../components/BookingCard';
import { Search, Loader2, CalendarDays, CheckCircle, Clock, XCircle } from 'lucide-react';

// Tabs
const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'New', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'completed', label: 'Completed', icon: CalendarDays },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle },
];

// ============================
// Skeleton components
// ============================
const Bar = ({ className = '' }) => <div className={`bg-gray-200 rounded ${className}`} />;
const Circle = ({ className = '' }) => <div className={`bg-gray-200 rounded-full ${className}`} />;

const ChipSkeleton = () => (
  <div className="h-6 px-3 rounded-full border border-gray-200 bg-white flex items-center gap-2">
    <Circle className="w-2.5 h-2.5" />
    <Bar className="h-3 w-12" />
  </div>
);

const DetailRowSkeleton = () => (
  <div className="flex items-center gap-3">
    <Circle className="w-4.5 h-4.5" />
    <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline gap-1">
      <Bar className="h-3 w-24" />
      <Bar className="h-3 w-40" />
    </div>
  </div>
);

const BookingCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
    {/* Header */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-gray-50 border-b border-gray-200">
      <div className="w-20 h-20 rounded-lg bg-gray-200" />
      <div className="flex-1 min-w-0 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4" />
            <Bar className="h-5 w-40" />
          </div>
          <div className="flex flex-wrap gap-2">
            <ChipSkeleton />
            <ChipSkeleton />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Circle className="w-4 h-4" />
          <Bar className="h-3 w-56" />
        </div>
      </div>
    </div>

    {/* Main details */}
    <div className="p-5 grid gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailRowSkeleton />
        <DetailRowSkeleton />
        <DetailRowSkeleton />
        <DetailRowSkeleton />
      </div>

      {/* Pricing summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-lg bg-anzac-50/40 text-anzac-600 border border-anzac-200/60">
        <div className="flex items-center gap-3">
          <Circle className="w-6 h-6" />
          <Bar className="h-4 w-28" />
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <Bar className="h-6 w-36" />
          <div className="flex items-center gap-2">
            <Bar className="h-3 w-24" />
            <Bar className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>

    {/* Footer actions */}
    <div className="p-5">
      <div className="flex flex-col md:flex-row gap-3 w-full">
        <Bar className="h-10 w-full md:w-40 rounded-lg" />
        <Bar className="h-10 w-full md:w-32 rounded-lg" />
      </div>
    </div>
  </div>
);

const TabPillSkeleton = () => (
  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border bg-white">
    <Circle className="w-4 h-4" />
    <Bar className="h-3 w-10" />
    <Bar className="h-5 w-6 rounded-full" />
  </div>
);

const BookingsSkeleton = () => (
  <div className="space-y-5 animate-pulse">
    {/* Header */}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Bar className="h-5 w-32" />
        <Bar className="h-3 w-64" />
      </div>
      <Bar className="h-10 w-24 rounded-lg" />
    </div>

    {/* Tabs */}
    <div className="flex flex-wrap items-center gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <TabPillSkeleton key={i} />
      ))}
    </div>

    {/* Search */}
    <div className="relative max-w-xl">
      <div className="w-full h-12 rounded-full bg-gray-200" />
    </div>

    {/* Grid */}
    <div className="grid lg:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <BookingCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

const BookingsPage = () => {
  const { vendorData } = useOutletContext();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  if (!vendorData.vendorInfo.verified) return <PendingNotice title="Application under process" />;

  // Fetch bookings from API
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      // Fixed the broken call parentheses below so it compiles
      const response = await axios.get(buildApiUrl('/api/vendor/bookings'));
      if (response.data.success) {
        setBookings(response.data.data || []);
      } else {
        toast.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Fetch bookings error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load bookings';
      toast.error(errorMessage);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const counts = useMemo(() => {
    const c = { all: bookings.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    bookings.forEach(b => { if (c[b.status] !== undefined) c[b.status] += 1; });
    return c;
  }, [bookings]);

  const filtered = useMemo(() => {
    let list = [...bookings];
    if (activeTab !== 'all') list = list.filter(b => b.status === activeTab);
    if (debounced) {
      list = list.filter(b =>
        [
          b.bookingNumber, b.customer?.name, b.customer?.phone,
          b.location?.address, b.status, b.paymentStatus
        ].join(' ').toLowerCase().includes(debounced)
      );
    }
    list.sort((a, b) => {
      if (['pending', 'confirmed'].includes(activeTab)) {
        return new Date(a.serviceDate) - new Date(b.serviceDate);
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    return list;
  }, [bookings, activeTab, debounced]);

  const updateStatus = async (id, nextStatus) => {
    try {
      const originalBookings = [...bookings];
      setBookings(prev => prev.map(b => b._id === id ? {
        ...b,
        status: nextStatus,
        confirmedAt: nextStatus === 'confirmed' ? new Date().toISOString() : b.confirmedAt,
        cancelledAt: nextStatus === 'cancelled' ? new Date().toISOString() : b.cancelledAt
      } : b));

      const token = localStorage.getItem('vendorToken');
      const response = await axios.patch(
        buildApiUrl(`/api/vendor/bookings/${id}/status`),
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const updatedBooking = response.data.data;
        setBookings(prev => prev.map(b => b._id === id ? updatedBooking : b));
        toast.success(response.data.message || `Booking marked as ${nextStatus}`);
      } else {
        setBookings(originalBookings);
        toast.error('Failed to update booking status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      setBookings(prev => prev.map(b => b._id === id ?
        bookings.find(orig => orig._id === id) || b : b
      ));
      const errorMessage = error.response?.data?.message || 'Failed to update booking status';
      toast.error(errorMessage);
    }
  };

  // Loading -> skeleton screen
  if (isLoading) {
    return <BookingsSkeleton />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Bookings</h2>
          <p className="text-sm text-gray-500">Track and update booking status</p>
        </div>
        <button
          onClick={fetchBookings}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key;
          const count = counts[key] ?? 0;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-sm transition ${
                active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-800 hover:bg-gray-100'
              }`}
            >
              {Icon ? <Icon className="w-4 h-4" /> : null}
              <span>{label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-700'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative max-w-xl">
        <div className="absolute inset-0 rounded-full shadow-sm pointer-events-none" />
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-full border focus:ring-2 focus:ring-gray-900/10 outline-none placeholder:text-gray-400"
          placeholder="Search by booking no, customer, phone, location…"
        />
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-700 font-medium">No bookings yet</p>
          <p className="text-sm text-gray-500 mt-1">Bookings from customers will appear here</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-700 font-medium">No bookings match your filters</p>
          <p className="text-sm text-gray-500 mt-1">Try a different search</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {filtered.map((b) => (
            <BookingCard
              key={b._id}
              booking={b}
              onUpdateStatus={(st) => updateStatus(b._id, st)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
