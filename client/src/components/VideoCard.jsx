import React from "react";
import { UserCircle2, CalendarCheck2, Star } from "lucide-react";

const VideoCard = ({ item, onPlay }) => {
  return (
    <div
      onClick={() => onPlay()}
      className="min-w-[300px] max-w-[300px] flex-shrink-0 bg-white rounded-2xl shadow-lg transition-transform duration-300 cursor-pointer overflow-hidden"
    >
      {/* Video Thumbnail */}
      <div className="relative h-48 overflow-hidden group">
        <img
          src={item.thumb}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Play Button - only visible on hover */}
        <button
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Play video"
        >
          <div className="bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition duration-300 transform group-hover:scale-110">
            <svg
              className="w-8 h-8 text-anzac-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>

        {/* Duration Badge */}
        <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-lg text-sm font-medium">
          {item.duration}
        </div>

        {/* Verified Badge */}
        {item.isVerified && (
          <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Verified
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 bg-gradient-to-tr from-anzac-50 via-white to-anzac-100 shadow-sm hover:shadow-md transition-all space-y-4">
        {/* Title */}
        <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-1">
          {item.title}
        </h3>

        {/* Host */}
        <div className="flex items-center gap-2 mb-3 text-gray-700">
          <UserCircle2 className="w-5 h-5 text-anzac-600" />
          <span className="font-medium">Host: {item.vendorName}</span>
        </div>

        {/* Rating & Bookings */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
            <span className="text-gray-800 font-semibold">{item.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <CalendarCheck2 className="w-4 h-4 text-anzac-500" />
            <span>{item.completedBookings} bookings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
