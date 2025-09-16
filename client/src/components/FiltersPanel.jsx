/* src/components/FiltersPanel.jsx */
import React, { useState, useEffect, useRef } from "react";
import { X, MapPin, Filter, Star } from "lucide-react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const ratingOptions = [
  { value: 0, label: "Any Rating" },
  { value: 4, label: "4★ & above" },
  { value: 4.5, label: "4.5★ & above" },
];

// Indian states and cities data
const statesAndCities = {
  "Andhra Pradesh": ["Hyderabad", "Visakhapatnam", "Vijayawada", "Guntur", "Kurnool", "Nellore", "Kadapa", "Tirupati"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Mahbubnagar"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davanagere"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Tirunelveli"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
};

const FiltersPanel = ({ isOpen, onClose, onApply }) => {
  const [price, setPrice] = useState([500, 50000]);
  const [rating, setRating] = useState(0);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const debounceTimer = useRef(null);
  const locationRef = useRef(null);

  // Get cities for selected state
  const getCitiesForState = () => {
    return selectedState ? statesAndCities[selectedState] || [] : [];
  };

  // Fetch location suggestions from OpenStreetMap
  const fetchLocations = async (query) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
          query
        )}&limit=5&addressdetails=1&countrycodes=in&accept-language=en-IN`
      );
      const data = await response.json();
      
      const formatted = data.map((s) => {
        const { road, neighbourhood, suburb, city, town, village, state, postcode } =
          s.address || {};
        const displayParts = [
          road || neighbourhood || suburb,
          city || town || village,
          state,
          postcode
        ].filter(Boolean);
        return {
          ...s,
          displayFormatted: displayParts.join(", ") || s.display_name
        };
      });
      setSuggestions(formatted);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (value.trim().length > 2) {
      debounceTimer.current = setTimeout(
        () => fetchLocations(value.trim()),
        300
      );
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (s) => {
    setLocation(s.displayFormatted);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setSelectedCity(""); // Reset city when state changes
    if (state) {
      setLocation(state);
    }
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    if (city && selectedState) {
      setLocation(`${city}, ${selectedState}`);
    } else if (selectedState) {
      setLocation(selectedState);
    }
  };

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const handleApply = () => {
    const finalLocation = selectedCity && selectedState 
      ? `${selectedCity}, ${selectedState}` 
      : selectedState || location;
      
    onApply({ 
      location: finalLocation, 
      price, 
      rating,
      state: selectedState,
      city: selectedCity
    });
    onClose();
  };

  const clearFilters = () => {
    setLocation("");
    setSelectedState("");
    setSelectedCity("");
    setPrice([500, 50000]);
    setRating(0);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      
      {/* Panel */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-lg z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <Filter className="w-5 h-5 text-anzac-600" />
            Filters
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Location Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-anzac-600" />
              Location
            </h3>
            
            {/* State Selection */}
            <div className="space-y-3">
              <select
                value={selectedState}
                onChange={handleStateChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm
                           focus:border-anzac-500 focus:ring-2 focus:ring-anzac-100 outline-none"
              >
                <option value="">Select State</option>
                {Object.keys(statesAndCities).map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>

              {/* City Selection */}
              {selectedState && (
                <select
                  value={selectedCity}
                  onChange={handleCityChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm
                             focus:border-anzac-500 focus:ring-2 focus:ring-anzac-100 outline-none"
                >
                  <option value="">Select City (Optional)</option>
                  {getCitiesForState().map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              )}
            </div>

            {/* OR custom location input */}
            <div className="mt-3">
              <div className="text-center text-xs text-gray-400 mb-2">OR</div>
              <div ref={locationRef} className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={handleLocationChange}
                  placeholder="Enter specific location..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm
                             focus:border-anzac-500 focus:ring-2 focus:ring-anzac-100 outline-none"
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-anzac-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border shadow-lg max-h-40 overflow-y-auto">
                    {suggestions.map((s) => (
                      <div
                        key={s.place_id}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSuggestionClick(s)}
                        className="px-3 py-2 cursor-pointer hover:bg-anzac-50 text-sm border-b border-gray-100 last:border-b-0"
                      >
                        {s.displayFormatted}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Price Range</h3>
            <Slider
              range
              min={500}
              max={100000}
              step={500}
              value={price}
              onChange={(val) => setPrice(val)}
              trackStyle={[{ backgroundColor: "#c48c2e", height: 6 }]}
              handleStyle={[
                { borderColor: "#c48c2e", backgroundColor: "#c48c2e" },
                { borderColor: "#c48c2e", backgroundColor: "#c48c2e" },
              ]}
              railStyle={{ backgroundColor: "#f3f4f6", height: 6 }}
            />
            <div className="flex justify-between mt-3 text-sm text-gray-700">
              <span>₹{price[0].toLocaleString()}</span>
              <span>₹{price[1].toLocaleString()}</span>
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-anzac-600" />
              Rating
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {ratingOptions.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium border transition text-left
                    ${
                      rating === value
                        ? "bg-anzac-500 text-white border-anzac-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-anzac-400"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={clearFilters}
            className="flex-1 rounded-full border border-gray-300 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="flex-1 rounded-full bg-anzac-500 text-white py-3 text-sm font-medium hover:bg-anzac-600 transition"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
};

export default FiltersPanel;
