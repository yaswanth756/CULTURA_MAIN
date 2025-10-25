// BookingCard.jsx - RESPONSIVE ONLY
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, PhoneCall, Star } from 'lucide-react';

const BookingCard = ({ 
  booking, 
  index, 
  onView, 
  onReview, 
  formatINR 
}) => {
  const { 
    _id, id, title, vendor, vendorPhone, serviceDate, 
    depositAmount, payableAmount, bookingStatus, bookingNumber,
    imageUrl, canReview, hasReview, needsReviewPrompt
  } = booking;

  const bookingId = _id || id;
  const letter = (vendor || "V").toString().trim().charAt(0).toUpperCase();
  const displayPayableAmount = bookingStatus === "completed" ? 0 : payableAmount;

  const getStatusStyle = (status) => {
    switch (status) {
      case "confirmed": return "bg-emerald-100 text-emerald-800";
      case "cancelled": return "bg-rose-100 text-rose-800";
      case "pending": return "bg-amber-100 text-amber-800";
      case "completed": return "bg-sky-100 text-sky-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleView = () => onView(booking);
  const handleReviewClick = (e) => {
    e.stopPropagation();
    onReview(booking);
  };

  return (
    <motion.div
      key={bookingId}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ 
        duration: 0.2, 
        delay: index * 0.03,
        ease: "easeOut" 
      }}
      className="border-b last:border-0"
    >
      <div className="bg-white p-3 sm:p-4 lg:p-5 hover:bg-gray-50/80 transition-colors">
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
          
          {/* Thumbnail */}
          <button
            type="button"
            onClick={handleView}
            className="relative h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 border hover:shadow-md transition-shadow"
          >
            {imageUrl ? (
              <img src={imageUrl} alt={title || 'Service'} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full grid place-items-center text-gray-500 font-bold text-xl sm:text-2xl">
                {letter}
              </div>
            )}
          </button>

          {/* Middle Section: Details */}
          <div className="flex-1 min-w-0">
            <button
              type="button"
              onClick={handleView}
              className="w-full text-left"
            >
              <div className="flex items-baseline gap-2 sm:gap-3">
                <h3 className="font-bold text-sm sm:text-base lg:text-lg text-gray-800 truncate hover:text-blue-600 transition-colors">
                  {vendor}
                </h3>
                <span className="text-[10px] sm:text-xs font-mono text-gray-400 truncate">#{bookingNumber}</span>
              </div>

              <div className="mt-2 sm:mt-2.5 space-y-1.5 sm:space-y-2">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-gray-50 text-gray-700 px-2 sm:px-2.5 py-1 text-xs sm:text-sm">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                  <span className="truncate">
                    {new Date(serviceDate).toLocaleDateString("en-IN", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                  <PhoneCall className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                  <span className="font-medium truncate">{vendorPhone}</span>
                </div>

                {hasReview && (
                  <div className="inline-flex items-center gap-1 text-xs text-green-600">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Review submitted</span>
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Right Section: Amounts & Actions */}
          <div className="flex flex-col items-end justify-between self-stretch gap-2 sm:gap-3">
            {/* Amounts */}
            <div className="flex gap-3 sm:gap-4 lg:gap-6">
              <div className="text-right">
                <div className="text-[10px] sm:text-xs lg:text-sm text-gray-500">Deposit</div>
                <div className="text-xs sm:text-sm lg:text-base font-bold text-emerald-600 whitespace-nowrap">
                  {formatINR(depositAmount)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] sm:text-xs lg:text-sm text-gray-500">Balance</div>
                <div className="text-xs sm:text-sm lg:text-base font-bold text-blue-600 whitespace-nowrap">
                  {formatINR(displayPayableAmount)}
                </div>
              </div>
            </div>

            {/* Status & Review Button */}
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-2">
              <span className={`px-2 sm:px-3 py-1 rounded-full font-medium text-[10px] sm:text-xs whitespace-nowrap ${getStatusStyle(bookingStatus)}`}>
                {bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1)}
              </span>

              {canReview && !hasReview && (
                <button
                  onClick={handleReviewClick}
                  className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 min-h-[32px] rounded-full bg-orange-100 text-orange-800 text-[10px] sm:text-xs font-medium hover:bg-orange-200 transition-colors whitespace-nowrap"
                >
                  <Star className="w-3 h-3 flex-shrink-0" />
                  <span className="hidden sm:inline">Review</span>
                  {needsReviewPrompt && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Chevron */}
          <button
            type="button"
            onClick={handleView}
            className="hidden sm:block pl-2 lg:pl-4 hover:text-blue-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(BookingCard);
