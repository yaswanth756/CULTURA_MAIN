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

const RowChips = ({ icon: Icon, items = [], max = 3, labelSr }) => {
  const shown = items.slice(0, max);
  const remaining = Math.max(items.length - shown.length, 0);
  if (items.length === 0) return null;

  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded bg-gray-100">
        <Icon className="w-3.5 h-3.5 text-gray-700" />
        <span className="sr-only">{labelSr}</span>
      </span>
      <div className="flex flex-wrap gap-2">
        {shown.map((val) => (
          <span key={val} className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
            {val}
          </span>
        ))}
        {remaining > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
            +{remaining} more
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

  return (
    <div className={`group bg-white border rounded-xl overflow-hidden hover:shadow-sm transition ${
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
              className={`w-full h-full object-cover group-hover:scale-[1.01] transition-transform ${
                !isActive ? 'grayscale' : ''
              }`} 
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-gray-400 text-sm">No image</div>
          )}
          
          {/* Category chip */}
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-[11px]">
            <CatIcon className="w-3.5 h-3.5" />
            {listing.category}
          </span>
          
          {/* Status indicator */}
          <span className={`absolute right-2 top-2 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium ${
            isActive 
              ? 'bg-green-500/90 text-white' 
              : 'bg-gray-500/90 text-white'
          }`}>
            {isActive ? (
              <>
                <Circle className="w-3 h-3 fill-current" />
                Active
              </>
            ) : (
              <>
                <Pause className="w-3 h-3" />
                Inactive
              </>
            )}
          </span>
        </div>
      </button>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Title + Rating */}
        <div className="flex items-start justify-between gap-3">
          <h3 className={`font-semibold line-clamp-1 ${
            isActive ? 'text-gray-900' : 'text-gray-600'
          }`}>
            {listing.title}
          </h3>
          <div className="inline-flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="font-medium">
              {listing.ratings?.average ? listing.ratings.average.toFixed(1) : '—'}
            </span>
            <span className="text-gray-500">({listing.ratings?.count || 0})</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 text-gray-900">
          <IndianRupee className="w-4 h-4 text-gray-700" />
          <span className="font-semibold">{inr(listing.price?.base)}</span>
          <span className="text-gray-500 text-sm">• {priceUnit}</span>
        </div>

        {/* Locations */}
        <RowChips icon={MapPin} items={listing.serviceAreas || []} max={3} labelSr="Service areas" />

        {/* Tags */}
        <RowChips icon={Tag} items={listing.tags || []} max={3} labelSr="Tags" />

        {/* Footer: CTA + Status */}
        <div className="pt-1 flex items-center justify-between">
          <div className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
            isActive 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-gray-50 text-gray-600 border border-gray-200'
          }`}>
            {isActive ? (
              <>
                <Circle className="w-3 h-3 fill-current" />
                Live
              </>
            ) : (
              <>
                <Pause className="w-3 h-3" />
                Hidden
              </>
            )}
          </div>
          
          <button
            onClick={onClick}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
            aria-label="View details"
          >
            <Eye className="w-4 h-4" />
            View / Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
