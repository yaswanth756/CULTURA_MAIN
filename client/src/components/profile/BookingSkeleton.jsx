import React from 'react';

const BookingSkeleton = () => (
  <div className="px-4 md:px-6 py-4" data-aos="fade-up">
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-xl bg-gray-200 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-56 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="w-40 space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-24 bg-gray-200 rounded ml-auto animate-pulse" />
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
