// src/vendor/components/ListingCard.jsx
import React from 'react';
import {
  Star,
  IndianRupee,
  MapPin,
  Tag,
  Camera,
  Music,
  Sparkles,
  Utensils,
  Building2,
  Video,
  Flower2,
  Eye,
  Circle,
  Pause
} from 'lucide-react';

const inr = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const categoryIcon = (cat) => {
  switch (cat) {
    case 'photography':  return Camera;
    case 'videography':  return Video;
    case 'music':        return Music;
    case 'catering':     return Utensils;
    case 'venues':       return Building2;
    case 'decorations':  return Flower2;
    case 'makeup':       return Sparkles;
    default:             return Tag;
  }
};

const RowChips = ({ icon: Icon, items = [], max = 2, labelSr }) => {
  const shown = items.slice(0, max);
  const remaining = Math.max(items.length - shown.length, 0);
  if (items.length === 0) return null;

  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded bg-gray-100 flex-shrink-0">
        <Icon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-gray-600" />
        <span className="sr-only">{labelSr}</span>
      </span>
      <div className="flex flex-wrap gap-1.5">
        {shown.map((val) => (
          <span 
            key={val} 
            className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] sm:text-xs font-medium"
          >
            {val}
          </span>
        ))}
        {remaining > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] sm:text-xs">
            +{remaining}
          </span>
        )}
      </div>
    </div>
  );
};

const ListingCard = ({ listing, onClick }) => {
  const img = listing.images?.[0];
  const CatIcon = categoryIcon(listing.category);
  const isActive = listing.status === 'active';

  const priceUnit =
    listing.price?.type === 'per_person'
      ? 'per person'
      : listing.price?.type === 'per_day'
      ? 'per day'
      : listing.price?.type === 'per_hour'
      ? 'per hour'
      : 'per event';

  // Fix rating decimal
  const displayRating = listing.ratings?.average 
    ? Number(listing.ratings.average).toFixed(1) 
    : null;

  return (
    <div className={`group bg-white border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all active:scale-[0.98] ${
      !isActive ? 'opacity-75' : ''
    }`}>
      {/* Clickable cover */}
      <button
        onClick={onClick}
        className="w-full text-left"
        aria-label={`Open ${listing.title} details`}
      >
        <div className="relative aspect-[4/3] bg-gray-100">
          {img ? (
            <img 
              src={img} 
              alt={listing.title} 
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                !isActive ? 'grayscale' : ''
              }`} 
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-gray-400 text-xs sm:text-sm">
              No image
            </div>
          )}
          
          {/* Category chip */}
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-medium">
            <CatIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span className="capitalize">{listing.category}</span>
          </span>
          
          {/* Status indicator */}
          <span className={`absolute right-2 top-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg backdrop-blur-sm text-[10px] sm:text-[11px] font-semibold ${
            isActive 
              ? 'bg-green-500/90 text-white' 
              : 'bg-gray-600/90 text-white'
          }`}>
            {isActive ? (
              <>
                <Circle className="w-2.5 sm:w-3 h-2.5 sm:h-3 fill-current" />
                Active
              </>
            ) : (
              <>
                <Pause className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                Paused
              </>
            )}
          </span>
        </div>
      </button>

      {/* Body */}
      <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
        {/* Title + Rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-semibold text-sm sm:text-base line-clamp-2 flex-1 ${
            isActive ? 'text-gray-900' : 'text-gray-600'
          }`}>
            {listing.title}
          </h3>
          {displayRating && (
            <div className="inline-flex items-center gap-0.5 text-xs sm:text-sm flex-shrink-0">
              <Star className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-500 fill-amber-500" />
              <span className="font-semibold text-gray-900">{displayRating}</span>
              <span className="text-gray-500">({listing.ratings?.count || 0})</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-1.5 text-gray-900">
          <IndianRupee className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-600 flex-shrink-0" />
          <span className="font-bold text-sm sm:text-base">{inr(listing.price?.base)}</span>
          <span className="text-gray-500 text-[10px] sm:text-xs">/ {priceUnit}</span>
        </div>

        {/* Locations */}
        {listing.serviceAreas && listing.serviceAreas.length > 0 && (
          <RowChips icon={MapPin} items={listing.serviceAreas} max={2} labelSr="Service areas" />
        )}

        {/* Tags */}
        {listing.tags && listing.tags.length > 0 && (
          <RowChips icon={Tag} items={listing.tags} max={2} labelSr="Tags" />
        )}

        {/* Footer: Status + CTA */}
        <div className="pt-2 flex items-center justify-between gap-2 border-t border-gray-100">
          <div className={`inline-flex items-center gap-1 text-[10px] sm:text-xs px-2 py-1 rounded-full font-medium ${
            isActive 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            {isActive ? (
              <>
                <Circle className="w-2 sm:w-2.5 h-2 sm:h-2.5 fill-current" />
                Live
              </>
            ) : (
              <>
                <Pause className="w-2 sm:w-2.5 h-2 sm:h-2.5" />
                Hidden
              </>
            )}
          </div>
          
          <button
            onClick={onClick}
            className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium text-gray-700"
            aria-label="View and edit listing"
          >
            <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span className="hidden sm:inline">View / Edit</span>
            <span className="sm:hidden">Edit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
