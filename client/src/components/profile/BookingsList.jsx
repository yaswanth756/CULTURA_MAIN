// components/BookingsList.jsx
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import BookingCard from './BookingCard';
import { Calendar, XCircle } from 'lucide-react';

const RowSkeleton = () => (
  <div className="px-4 md:px-6 py-4" data-aos="fade-up">
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-xl bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-56 bg-gray-200 rounded" />
        <div className="h-3 w-32 bg-gray-200 rounded" />
      </div>
      <div className="w-40 space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-200 rounded ml-auto" />
      </div>
    </div>
  </div>
);

const BookingsList = ({ 
  loading, 
  error, 
  filteredBookings, 
  onRetry, 
  onViewDetails, 
  onWriteReview,
  formatINR 
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="divide-y">
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="p-12 text-center" data-aos="fade-up">
          <XCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (filteredBookings.length === 0) {
    return (
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="p-14 text-center" data-aos="fade-up">
          <div className="w-14 h-14 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-[15px] font-medium text-gray-900 mb-1">No bookings found</h3>
          <p className="text-gray-500 text-[13px]">Try a different filter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden" data-aos="fade-up" data-aos-delay="80">
      <AnimatePresence mode="popLayout">
        {filteredBookings.map((booking, index) => (
          <BookingCard
            key={booking._id || booking.id}
            booking={booking}
            index={index}
            onViewDetails={onViewDetails}
            onWriteReview={onWriteReview}
            formatINR={formatINR}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default BookingsList;
