import React from "react";
import { ChevronLeft, ChevronRight, X, Star, CheckCircle,CalendarIcon } from "lucide-react";

const VideoModal = ({ 
  isOpen, 
  onClose, 
  currentItem, 
  currentIndex, 
  totalItems, 
  onNext, 
  onPrev 
}) => {
  if (!isOpen || !currentItem) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl mx-4 bg-white rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="text-sm text-gray-500 font-medium">
            {currentIndex + 1} of {totalItems}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Video Container */}
        <div className="relative bg-black">
          <video
            key={currentItem.id}
            src={currentItem.src}
            controls
            autoPlay
            className="w-full h-[60vh] object-contain"
          />
          
          {/* Navigation Buttons */}
          {totalItems > 1 && (
            <>
              <button
                onClick={onPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105"
                aria-label="Previous video"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105"
                aria-label="Next video"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
                {currentItem.title}
              </h3>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">
                    {currentItem.vendorName}
                  </span>
                  {currentItem.isVerified && (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium text-gray-800">
                    {currentItem.rating}
                  </span>
                </div>

                <span className="flex gap-1 items-center"><CalendarIcon className="h-4 "/> <span className="font-bold text-blue-500 text-lg">{currentItem.completedBookings}</span> bookings</span>
              </div>
            </div>
            
            <button
              onClick={() => window.location.href = `/browse?vendor=${currentItem.vendorName}`}
              className="px-6 py-3 bg-anzac-500 hover:bg-anzac-600 text-white font-medium rounded-lg transition-colors duration-200 whitespace-nowrap"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
