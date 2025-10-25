// BookingSkeleton.jsx - RESPONSIVE OPTIMIZED
import React from 'react';

const BookingSkeleton = () => (
  <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4" data-aos="fade-up">
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <div className="h-3 sm:h-4 w-40 sm:w-56 bg-gray-200 rounded animate-pulse" />
        <div className="h-2.5 sm:h-3 w-24 sm:w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="w-32 sm:w-40 space-y-2 flex-shrink-0">
        <div className="h-3 sm:h-4 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-2.5 sm:h-3 w-16 sm:w-24 bg-gray-200 rounded ml-auto animate-pulse" />
      </div>
    </div>
  </div>
);

const BookingSkeletonList = () => (
  <div className="divide-y">
    <BookingSkeleton />
    <BookingSkeleton />
    <BookingSkeleton />
  </div>
);

export default BookingSkeletonList;
