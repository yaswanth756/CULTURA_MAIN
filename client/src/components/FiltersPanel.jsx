/* src/components/FiltersPanel.jsx */
import React, { useState, useEffect, useRef } from "react";
import { X, MapPin, Filter, Star, TrendingUp } from "lucide-react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const ratingOptions = [
  { value: 0, label: "Any Rating", emoji: "⭐" },
  { value: 4, label: "4+ Stars", emoji: "🌟" },
  { value: 4.5, label: "4.5+ Stars", emoji: "✨" },
];

// Popular cities for quick selection
const popularLocations = [
  { name: "Hyderabad", region: "Telangana", emoji: "🏛️" },
  { name: "Mumbai", region: "Maharashtra", emoji: "🏙️" },
  { name: "Chennai", region: "Tamil Nadu", emoji: "🌊" },
  { name: "Bangalore", region: "Karnataka", emoji: "🌳" },
  { name: "Pune", region: "Maharashtra", emoji: "🎓" },
  { name: "Visakhapatnam", region: "Andhra Pradesh", emoji: "⛱️" },
  { name: "Vijayawada", region: "Andhra Pradesh", emoji: "🏞️" },
  { name: "Nellore", region: "Andhra Pradesh", emoji: "🌾" },
  { name: "Tirupati", region: "Andhra Pradesh", emoji: "🛕" },
  { name: "Kochi", region: "Kerala", emoji: "🌴" }
];

const FiltersPanel = ({ isOpen, onClose, onApply, initialFilters }) => {
  const [price, setPrice] = useState(initialFilters?.price || [500, 50000]);
  const [rating, setRating] = useState(initialFilters?.rating || 0);
  const [location, setLocation] = useState(initialFilters?.location || "");
  const [customLocation, setCustomLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const debounceTimer = useRef(null);
  const locationRef = useRef(null);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch location suggestions
  const fetchLocationSuggestions = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=in&accept-language=en-IN`
      );
      const data = await response.json();
      
      const formatted = data.map((item) => {
        const { city, town, village, state } = item.address || {};
        const displayName = [city || town || village, state].filter(Boolean).join(", ");
        return {
          ...item,
          displayName: displayName || item.display_name
        };
      });
      
      setSuggestions(formatted.slice(0, 5));
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomLocationChange = (e) => {
    const value = e.target.value;
    setCustomLocation(value);
    setLocation(value); // Update main location state
    
    // Clear existing timer
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    // Debounce API calls
    debounceTimer.current = setTimeout(() => {
      fetchLocationSuggestions(value);
    }, 300);
  };

  const handleSuggestionClick = (suggestion) => {
    setLocation(suggestion.displayName);
    setCustomLocation(suggestion.displayName);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handlePopularLocationClick = (locationName) => {
    setLocation(locationName);
    setCustomLocation(""); // Clear custom input when popular location is selected
    setShowSuggestions(false);
  };

  const handleApply = () => {
    onApply({
      location: location.trim(),
      price,
      rating
    });
  };

  const clearAllFilters = () => {
    setLocation("");
    setCustomLocation("");
    setPrice([500, 50000]);
    setRating(0);
    setShowSuggestions(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Panel */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl z-50 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-anzac-50 to-orange-50">
          <h2 className="flex items-center gap-3 text-xl font-bold text-gray-800">
            <div className="p-2 bg-anzac-500 rounded-xl">
              <Filter className="w-5 h-5 text-white" />
            </div>
            Find Perfect Vendors
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
          
          {/* Popular Locations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-anzac-600" />
              <h3 className="font-semibold text-gray-800">Popular Cities</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {popularLocations.map((city) => (
                <button
                  key={city.name}
                  onClick={() => handlePopularLocationClick(city.name)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                    location === city.name
                      ? "border-anzac-500 bg-anzac-50 text-anzac-700 shadow-md"
                      : "border-gray-200 bg-white text-gray-600 hover:border-anzac-300 hover:bg-anzac-25"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{city.emoji}</span>
                    <span className="font-medium text-sm">{city.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{city.region}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Location */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-anzac-600" />
              <h3 className="font-semibold text-gray-800">Or enter custom location</h3>
            </div>
            
            <div ref={locationRef} className="relative">
              <input
                type="text"
                value={customLocation}
                onChange={handleCustomLocationChange}
                placeholder="Type city or area name..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-anzac-500 focus:outline-none transition-colors text-gray-700 placeholder-gray-400"
              />
              
              {isLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-5 w-5 border-2 border-anzac-500 border-t-transparent rounded-full"></div>
                </div>
              )}
              
              {/* Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.place_id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-anzac-50 transition-colors border-b border-gray-100 last:border-b-0 text-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{suggestion.displayName}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              💰 Price Range
            </h3>
            <div className="px-2">
              <Slider
                range
                min={500}
                max={100000}
                step={500}
                value={price}
                onChange={(val) => setPrice(val)}
                trackStyle={[{ backgroundColor: "#c48c2e", height: 6 }]}
                handleStyle={[
                  { 
                    borderColor: "#c48c2e", 
                    backgroundColor: "#c48c2e",
                    width: 20,
                    height: 20,
                    marginTop: -7
                  },
                  { 
                    borderColor: "#c48c2e", 
                    backgroundColor: "#c48c2e",
                    width: 20,
                    height: 20,
                    marginTop: -7
                  },
                ]}
                railStyle={{ backgroundColor: "#f1f5f9", height: 6 }}
              />
              <div className="flex justify-between mt-4 text-sm font-medium">
                <span className="px-3 py-1 bg-anzac-100 text-anzac-700 rounded-full">
                  ₹{price[0].toLocaleString()}
                </span>
                <span className="px-3 py-1 bg-anzac-100 text-anzac-700 rounded-full">
                  ₹{price[1].toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-anzac-600" />
              Minimum Rating
            </h3>
            <div className="flex gap-3">
              {ratingOptions.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200 ${
                    rating === value
                      ? "border-anzac-500 bg-anzac-500 text-white shadow-lg"
                      : "border-gray-200 bg-white text-gray-600 hover:border-anzac-300 hover:bg-anzac-50"
                  }`}
                >
                  <div className="text-lg mb-1">{emoji}</div>
                  <div className="text-xs">{label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={clearAllFilters}
            className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-300 text-gray-600 font-medium hover:bg-gray-100 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="flex-2 py-3 px-6 rounded-xl bg-gradient-to-r from-anzac-500 to-anzac-600 text-white font-semibold hover:from-anzac-600 hover:to-anzac-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Custom styles */}
      <style jsx>{`
        @keyframes scale-up {
          from {
            transform: translate(-50%, -50%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default FiltersPanel;
