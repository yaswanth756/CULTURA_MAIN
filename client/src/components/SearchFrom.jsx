import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useEventContext } from "../context/EventContext";
import {
  Search,
  MapPin,
  PartyPopper,
  Camera,
  Utensils,
  Cake,
  Music,
  Building2,
  Video,
  Tent,
  Mic2,
  Brush,
  Flower2,
  X,
  Locate
} from "lucide-react";
import CustomDatePicker from "./CustomDatePicker";

const SearchForm = () => {
  const navigate = useNavigate();
  const { formData, setFormData } = useEventContext();

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showServiceMenu, setShowServiceMenu] = useState(false);

  const locationRef = useRef(null);
  const serviceRef = useRef(null);
  const debounceTimer = useRef(null);

  const services = [
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

  const fetchLocations = async (query) => {
    setLoadingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
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
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, location: value }));
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (value.length > 2) {
      debounceTimer.current = setTimeout(() => fetchLocations(value), 300);
    } else {
      setShowSuggestions(false);
      setLocationSuggestions([]);
    }
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, date }));
  };

  const handleSelectLocation = (suggestion) => {
    setFormData((prev) => ({ ...prev, location: suggestion.display_name }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (serviceRef.current && !serviceRef.current.contains(event.target)) {
        setShowServiceMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectService = (value) => {
    setFormData((prev) => ({ ...prev, eventType: value }));
    setShowServiceMenu(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (formData.location) params.append("location", formData.location);
    if (formData.date) params.append("date", formData.date);
    if (formData.eventType) params.append("category", formData.eventType);
    navigate(`/browse?${params.toString()}`);
  };

  const selectedService = services.find((s) => s.value === formData.eventType);

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-3xl md:rounded-full border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 p-2 max-w-6xl w-full mx-auto"
      data-aos="zoom-in"
      data-aos-duration="1200"
    >
      <div className="flex flex-col md:flex-row md:items-center md:divide-x divide-gray-200">
        {/* Location */}
        <div ref={locationRef} className="relative flex-1 min-w-0">
  <div className="flex items-center gap-3 px-4 py-3 md:px-5">
    <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0" />
    <input
      type="text"
      name="location"
      placeholder="Where Needed"
      value={formData.location}
      onChange={handleLocationChange}
      className="flex-1 min-w-0 bg-transparent placeholder:text-gray-400 text-gray-900 outline-none truncate"
      autoComplete="off"
    />

    {/* Loader container with fixed size */}
    <div className="w-5 h-5 ml-2 flex items-center justify-center">
      {loadingLocation && (
        <svg
          className="animate-spin h-4 w-4 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      )}
    </div>
  </div>

  {showSuggestions && (
  <ul className="absolute z-20 w-full md:w-[420px] bg-white border border-gray-100 rounded-xl mt-5 max-h-72 overflow-y-auto shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
    {loadingLocation ? (
      <li className="px-4 py-3 text-gray-500 text-sm">Searching...</li>
    ) : locationSuggestions.length > 0 ? (
      locationSuggestions.map((s, idx) => (
        <li
          key={idx}
          onClick={() => handleSelectLocation(s)}
          className="flex items-center gap-3 px-4 py-3 cursor-pointer text-[15px] text-gray-800 hover:bg-gray-50 transition-colors"
          title={s.display_name}
        >
          <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{s.display_name}</span>
        </li>
      ))
    ) : (
      <li className="px-4 py-3 text-gray-500 text-sm">No results</li>
    )}
  </ul>
)}


        </div>



        {/* Date */}
        <div className="shrink-0 md:basis-[220px] border-t md:border-t-0 border-gray-200">
          <div className="px-4 py-1 md:py-3 md:w-[200px]">
            <CustomDatePicker
              value={formData.date}
              onChange={handleDateChange}
              placeholder="Add dates"
            />
          </div>
        </div>

        {/* Service */}
        <div
          ref={serviceRef}
          className="relative shrink-0 md:basis-[200px] border-t md:border-t-0 border-gray-200"
        >
          <button
            type="button"
            onClick={() => setShowServiceMenu((v) => !v)}
            className="w-full text-left px-4 py-3 md:px-5"
          >
            <div className="inline-flex items-center gap-3">
              {selectedService ? (
                <selectedService.Icon className="w-5 h-5 text-gray-500" />
              ) : (
                <PartyPopper className="w-5 h-5 text-gray-400" />
              )}
              <span
                className={`truncate ${
                  selectedService ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {selectedService ? selectedService.label : "Service"}
              </span>
            </div>
          </button>
          {showServiceMenu && (
            <div className="absolute md:left-[20%] left-[50%] -translate-x-1/2 z-30 mt-5 w-[90vw] max-w-[600px] rounded-2xl border bg-white shadow-xl p-6 md:p-8">
              <button
                type="button"
                onClick={() => setShowServiceMenu(false)}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
              <ul className="flex flex-wrap gap-3">
                {services.map(({ value, label, Icon }) => {
                  const active = formData.eventType === value;
                  return (
                    <li key={value}>
                      <button
                        type="button"
                        onClick={() => handleSelectService(value)}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                          active
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-300 text-gray-800 hover:border-gray-500"
                        } transition-colors`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="p-2 md:p-0 md:pl-2">
          <button
            type="submit"
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-anzac-500 hover:bg-anzac-600 text-white px-6 py-3 rounded-full transition-all duration-300 shadow-md"
          >
            <Search className="w-5 h-5" />
            <span className="sm:not-sr-only">Search</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchForm;
