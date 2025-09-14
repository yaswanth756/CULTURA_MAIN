import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ChevronDown, Cake, Locate } from "lucide-react";
import CustomDatePicker from "./CustomDatePicker"; // Import the new component

const SearchForm = () => {
  const navigate = useNavigate();
  
  // Get today's date as default
  const getTodayDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };
  
  const [formData, setFormData] = useState({
    location: "",
    date: getTodayDate(), // Default to today's date
    eventType: "",
  });
  
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const locationRef = useRef(null);
  const debounceTimer = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle date change from CustomDatePicker
  const handleDateChange = (date) => {
    setFormData({ ...formData, date });
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, location: value });
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (value.length > 2) {
      debounceTimer.current = setTimeout(async () => {
        setLoadingLocation(true);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              value
            )}&limit=5&addressdetails=1&countrycodes=in`
          );
          const data = await response.json();
          setLocationSuggestions(data);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setLocationSuggestions([]);
        } finally {
          setLoadingLocation(false);
        }
      }, 1000);
    } else {
      setShowSuggestions(false);
      setLocationSuggestions([]);
    }
  };

  const handleSelectLocation = (suggestion) => {
    setFormData({ ...formData, location: suggestion.display_name });
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&countrycodes=in`
          );
          const data = await response.json();
          setFormData({
            ...formData,
            location:
              data.display_name ||
              `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          });
        } catch (error) {
          console.error("Error fetching reverse geocode:", error);
          setFormData({
            ...formData,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          });
        } finally {
          setLoadingLocation(false);
          setShowSuggestions(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please try manually.");
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(
      `/browse?location=${encodeURIComponent(
        formData.location
      )}&date=${formData.date}&eventType=${formData.eventType}`
    );
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-4 p-6 max-w-6xl mx-auto"
      data-aos="zoom-in"
      data-aos-duration="1200"
    >
      {/* Location Input */}
      <div ref={locationRef} className="relative flex-1">
        <div className="flex items-center bg-white rounded-lg border pl-3 pr-3">
          <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <input
            type="text"
            name="location"
            placeholder="Enter location"
            value={formData.location}
            onChange={handleLocationChange}
            className="flex-1 px-3 py-3 border-none outline-none text-gray-800"
            disabled={loadingLocation}
          />
          <div className="relative group">
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={loadingLocation}
              className="p-2 text-gray-500 hover:text-anzac-500 disabled:opacity-50 flex-shrink-0"
            >
              {loadingLocation ? (
                <div className="w-4 h-4 border-2 border-anzac-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Locate className="w-5 h-5" />
              )}
            </button>
            <span className="absolute left-0 bottom-[120%] mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded-sm opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
              Get current location
            </span>
          </div>
        </div>
        {showSuggestions && (
          <ul className="absolute z-20 w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
            {locationSuggestions.map((suggestion, idx) => (
              <li
                key={idx}
                onClick={() => handleSelectLocation(suggestion)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-800"
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
        {loadingLocation && !showSuggestions && (
          <div className="absolute right-12 top-3 text-xs text-anzac-500">
            Fetching...
          </div>
        )}
      </div>

      {/* Custom Date Picker Component */}
      <CustomDatePicker
        value={formData.date}
        onChange={handleDateChange}
        placeholder="Select event date"
      />

      {/* Event Type Select */}
      <div className="relative flex-1">
        <div className="flex items-center bg-white rounded-lg border pl-3 pr-3">
          <Cake className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            className="flex-1 px-3 py-3 border-none outline-none text-gray-800 bg-transparent appearance-none"
          >
            <option value="">Select Event</option>
            <option value="wedding">Wedding</option>
            <option value="birthday">Birthday</option>
            <option value="house-ceremony">House Ceremony</option>
          </select>
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="flex items-center gap-2 bg-anzac-500 hover:bg-anzac-600 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg flex-shrink-0"
      >
        <Search className="w-5 h-5" />
        Search
      </button>
    </form>
  );
};

export default SearchForm;
