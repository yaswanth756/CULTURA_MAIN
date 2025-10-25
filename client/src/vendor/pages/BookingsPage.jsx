// src/vendor/pages/BookingsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { buildApiUrl } from '../../utils/api';
import PendingNotice from '../components/PendingNotice';
import BookingsFilters from '../components/BookingsFilters';
import BookingsTable from '../components/BookingsTable';
import { CalendarDays } from 'lucide-react';

const Bar = ({ className = '' }) => <div className={`bg-gray-200 rounded ${className} animate-pulse`} />;

const BookingsSkeleton = () => (
  <div className="space-y-4 sm:space-y-5">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Bar className="h-6 sm:h-7 w-28 sm:w-32" />
        <Bar className="h-3 sm:h-4 w-48 sm:w-64" />
      </div>
      <div className="flex gap-2">
        <Bar className="h-9 sm:h-10 w-16 sm:w-24 rounded-lg" />
        <Bar className="h-9 sm:h-10 w-16 sm:w-24 rounded-lg" />
      </div>
    </div>
    <div className="overflow-x-auto">
      <div className="flex gap-2 min-w-max pb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Bar key={i} className="h-9 w-20 sm:w-24 rounded-full" />
        ))}
      </div>
    </div>
    <Bar className="h-11 rounded-full" />
    <Bar className="h-96 rounded-xl" />
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

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('vendorToken');
      const response = await axios.get(buildApiUrl('/api/vendor/bookings'), {
        headers: { Authorization: `Bearer ${token}` }
      });
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
        [b.bookingNumber, b.customer?.name, b.customer?.phone, b.location?.address, b.status, b.paymentStatus]
        .join(' ').toLowerCase().includes(debounced)
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
      setBookings(prev => prev.map(b => b._id === id ? bookings.find(orig => orig._id === id) || b : b));
      const errorMessage = error.response?.data?.message || 'Failed to update booking status';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return <BookingsSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <BookingsFilters
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={counts}
        query={query}
        setQuery={setQuery}
        onRefresh={fetchBookings}
        isLoading={isLoading}
      />

      {bookings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <CalendarDays className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
          </div>
          <p className="text-gray-900 font-semibold text-base sm:text-lg">No bookings yet</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2">
            Bookings from customers will appear here
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <CalendarDays className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
          </div>
          <p className="text-gray-900 font-semibold text-base sm:text-lg">No results found</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2">
            Try adjusting your filters or search
          </p>
          <button
            onClick={() => {
              setQuery('');
              setActiveTab('all');
            }}
            className="mt-4 text-sm text-anzac-500 hover:text-anzac-600 font-medium transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <BookingsTable
          bookings={filtered}
          onUpdateStatus={updateStatus}
          totalCount={bookings.length}
        />
      )}
    </div>
  );
};

export default BookingsPage;
