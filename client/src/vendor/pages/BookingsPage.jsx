// src/vendor/pages/BookingsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import PendingNotice from '../components/PendingNotice';
import BookingCard from '../components/BookingCard';
import { Search, Loader2, CalendarDays, CheckCircle, Clock, XCircle } from 'lucide-react';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'New', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'completed', label: 'Completed', icon: CalendarDays },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle },
];

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
     
      const response = await axios.get('http://localhost:3000/api/vendor/bookings' 

    );

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

  // Update booking status with API call
  const updateStatus = async (id, nextStatus) => {
    try {
      // Optimistic update
      const originalBookings = [...bookings];
      setBookings(prev => prev.map(b => b._id === id ? {
        ...b,
        status: nextStatus,
        confirmedAt: nextStatus === 'confirmed' ? new Date().toISOString() : b.confirmedAt,
        cancelledAt: nextStatus === 'cancelled' ? new Date().toISOString() : b.cancelledAt
      } : b));

      const token = localStorage.getItem('vendorToken');
      const response = await axios.patch(
        `http://localhost:3000/api/vendor/bookings/${id}/status`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update with server response
        const updatedBooking = response.data.data;
        setBookings(prev => prev.map(b => b._id === id ? updatedBooking : b));
        toast.success(response.data.message || `Booking marked as ${nextStatus}`);
      } else {
        // Revert on failure
        setBookings(originalBookings);
        toast.error('Failed to update booking status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      
      // Revert optimistic update
      setBookings(prev => prev.map(b => b._id === id ? 
        bookings.find(orig => orig._id === id) || b : b
      ));
      
      const errorMessage = error.response?.data?.message || 'Failed to update booking status';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
          <p className="text-gray-600 mt-2">Loading bookings...</p>
        </div>
      </div>
    );
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
