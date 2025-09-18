/* src/components/SearchComponent.jsx */
import React, { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Building2,
  Utensils,
  Cake,
  Flower2,
  Camera,
  Video,
  Music,
  Brush,
  Tent,
  Mic2,
  X,
  User,
  IndianRupee,
  RotateCcw,
  MapPin,
  Star
} from "lucide-react";

const categories = [
  { value: "all", label: "All Services", Icon: Search },
  { value: "venues", label: "Venues", Icon: Building2 },
  { value: "catering", label: "Catering", Icon: Utensils },
  { value: "cakes", label: "Cakes", Icon: Cake },
  { value: "decorations", label: "Decorations", Icon: Flower2 },
  { value: "photography", label: "Photography", Icon: Camera },
  { value: "videography", label: "Videography", Icon: Video },
  { value: "music", label: "Music / DJ", Icon: Music },
  { value: "makeup", label: "Make-up", Icon: Brush },
  { value: "mandap", label: "Mandap Setup", Icon: Tent },
  { value: "hosts", label: "Hosts / Anchors", Icon: Mic2 },
];

// Keywords for animated placeholder
const SEARCH_KEYWORDS = [
  "location",
  "vendors", 
  "services",
  "decorations",
  "photographers",
  "venues",
  "catering",
  "music & DJ"
];

const SearchComponent = ({
  filtersFromUrl,
  onSearchChange,
  onCategoryChange,
  onShowFilters,
  onClearSingleFilter,
  onClearAll
}) => {
  // Typewriter animation states
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Typewriter animation effect
  useEffect(() => {
    const currentKeyword = SEARCH_KEYWORDS[placeholderIndex];
    
    if (isPaused) {
      const pauseTimer = setTimeout(() => setIsPaused(false), 1500);
      return () => clearTimeout(pauseTimer);
    }

    const typingSpeed = isDeleting ? 75 : 120;
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing characters
        if (displayText.length < currentKeyword.length) {
          setDisplayText(currentKeyword.slice(0, displayText.length + 1));
        } else {
          // Finished typing current word, pause then start deleting
          setIsPaused(true);
          setTimeout(() => setIsDeleting(true), 100);
        }
      } else {
        // Deleting characters
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          // Finished deleting, move to next word
          setIsDeleting(false);
          setPlaceholderIndex((prev) => (prev + 1) % SEARCH_KEYWORDS.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, placeholderIndex, isPaused]);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search Input with Animated Placeholder */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            value={filtersFromUrl.search}
            onChange={onSearchChange}
            placeholder={`Search by ${displayText}${!isDeleting && !isPaused ? '|' : ''}`}
            className="w-full pl-12 pr-24 py-3 rounded-full border border-gray-300 
                       focus:ring-2 focus:ring-anzac-200 focus:border-anzac-500 outline-none 
                       shadow-sm transition-all duration-300 placeholder:text-gray-500 
                       placeholder:transition-opacity placeholder:duration-300"
          />
          <button
            onClick={onShowFilters}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-anzac-500 text-white 
                       px-4 py-2 rounded-full hover:bg-anzac-600 transition flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Categories */}
        <div className="relative">
  {/* Right shadow fade */}
  <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-10" />

  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth relative">
    {categories.map((c) => (
      <button
        key={c.value}
        onClick={() => onCategoryChange(c.value)}
        className={`flex items-center gap-2 px-4 py-3 rounded-full border text-medium
                   transition whitespace-nowrap flex-shrink-0 ${
          filtersFromUrl.category === c.value
            ? "bg-anzac-500 text-white border-anzac-500 shadow"
            : "bg-white text-gray-700 border-gray-200 hover:border-anzac-300"
        }`}
      >
        <c.Icon className="w-4 h-4" />
        {c.label}
      </button>
    ))}
  </div>
        </div>


        {/* Active Filters Display */}
        {(filtersFromUrl.search || filtersFromUrl.location || filtersFromUrl.vendor || filtersFromUrl.priceMin || filtersFromUrl.rating) && (
          <div className="mt-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              
              {filtersFromUrl.search && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-anzac-100 text-anzac-800 rounded-lg text-sm font-medium">
                  <Search className="w-3 h-3" />
                  <span>"{filtersFromUrl.search}"</span>
                  <button onClick={() => onClearSingleFilter('q')} className="ml-1 p-0.5 rounded-full hover:bg-anzac-200">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {filtersFromUrl.location && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-anzac-50 text-anzac-800 rounded-lg text-sm font-medium">
                  <MapPin className="w-3 h-3" />
                  <span>{filtersFromUrl.location}</span>
                  <button onClick={() => onClearSingleFilter('location')} className="ml-1 p-0.5 rounded-full hover:bg-anzac-200">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {filtersFromUrl.vendor && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-anzac-50 text-anzac-800 rounded-lg text-sm font-medium">
                  <User className="w-3 h-3" />
                  <span>{filtersFromUrl.vendor}</span>
                  <button onClick={() => onClearSingleFilter('vendor')} className="ml-1 p-0.5 rounded-full hover:bg-anzac-200">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {filtersFromUrl.priceMin && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-anzac-50 text-anzac-800 rounded-lg text-sm font-medium">
                  <IndianRupee className="w-3 h-3" />
                  <span>₹{parseInt(filtersFromUrl.priceMin).toLocaleString()} - ₹{parseInt(filtersFromUrl.priceMax).toLocaleString()}</span>
                  <button onClick={() => onClearSingleFilter('price')} className="ml-1 p-0.5 rounded-full hover:bg-anzac-200">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {filtersFromUrl.rating && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-anzac-50 text-anzac-800 rounded-lg text-sm font-medium">
                  <Star className="w-3 h-3" />
                  <span>{filtersFromUrl.rating}+ rating</span>
                  <button onClick={() => onClearSingleFilter('rating')} className="ml-1 p-0.5 rounded-full hover:bg-anzac-200">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <button
                onClick={onClearAll}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-gray-900  rounded-full text-sm  transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide { 
          -ms-overflow-style: none; 
          scrollbar-width: none; 
        }
        .scrollbar-hide::-webkit-scrollbar { 
          display: none; 
        }
        
        /* Enhanced placeholder animation */
        input::placeholder {
          opacity: 1;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 400;
        }
        
        input:focus::placeholder {
          opacity: 0.7;
          transform: translateY(-1px);
        }
        
        /* Subtle cursor blink effect */
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SearchComponent;
