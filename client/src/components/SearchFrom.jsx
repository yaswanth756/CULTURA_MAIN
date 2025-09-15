import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Locate,
  PartyPopper,
  // chip icons
  Camera,
  ChefHat,
  Soup,
  Bed,
  Timer,
  Brush,
  Scissors,
  Flower2,
  Utensils,
  Sparkles,
  X,
} from "lucide-react";
import CustomDatePicker from "./CustomDatePicker";

const SearchForm = () => {
  const navigate = useNavigate();

  // Keep date empty so placeholder "Add dates" shows
  const [formData, setFormData] = useState({
    location: "",
    date: "",
    eventType: "",
  });

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [showServiceMenu, setShowServiceMenu] = useState(false);

  const locationRef = useRef(null);
  const serviceRef = useRef(null);
  const debounceTimer = useRef(null);

  // Services for chip menu
  const services = [
    { value: "photography", label: "Photography", Icon: Camera },
    { value: "chefs", label: "Chefs", Icon: ChefHat },
    { value: "prepared-meals", label: "Prepared meals", Icon: Soup },
    { value: "massage", label: "Massage", Icon: Bed },
    { value: "training", label: "Training", Icon: Timer },
    { value: "makeup", label: "Make-up", Icon: Brush },
    { value: "hair", label: "Hair", Icon: Scissors },
    { value: "spa", label: "Spa treatments", Icon: Flower2 },
    { value: "catering", label: "Catering", Icon: Utensils },
    { value: "nails", label: "Nails", Icon: Sparkles },
  ];

  // OpenStreetMap Nominatim search
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

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&countrycodes=in`
          );
          const data = await response.json();
          setFormData((prev) => ({
            ...prev,
            location:
              data.display_name ||
              `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          }));
        } catch (error) {
          console.error("Error fetching reverse geocode:", error);
          setFormData((prev) => ({
            ...prev,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          }));
        } finally {
          setLoadingLocation(false);
          setShowSuggestions(false);
        }
      },
      () => {
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
    const q = `/browse?location=${encodeURIComponent(
      formData.location
    )}&date=${formData.date}&eventType=${formData.eventType}`;
    navigate(q);
  };

  const selectedService = services.find((s) => s.value === formData.eventType);

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-2 max-w-6xl w-full mx-auto"
      data-aos="zoom-in"
      data-aos-duration="1200"
    >
      <div className="flex flex-col md:flex-row md:items-center divide-y md:divide-y-0 md:divide-x divide-gray-200">
        {/* Location (flexible) */}
        <div ref={locationRef} className="relative flex-1 min-w-0">
          <div className="flex items-center gap-3 px-5 py-3">
            <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <input
              type="text"
              name="location"
              placeholder="Where?"
              value={formData.location}
              onChange={handleLocationChange}
              className="flex-1 min-w-0 bg-transparent placeholder:text-gray-400 text-gray-900 outline-none"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
              aria-controls="location-suggestions"
            />
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={loadingLocation}
              className="p-2 text-gray-500 hover:text-anzac-500 disabled:opacity-50 flex-shrink-0"
              aria-label="Use current location"
              title="Use current location"
            >
              {loadingLocation ? (
                <div className="w-4 h-4 border-2 border-anzac-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Locate className="w-5 h-5" />
              )}
            </button>
          </div>

          {showSuggestions && (
            <ul
              id="location-suggestions"
              role="listbox"
              className="absolute z-20 w-full bg-white border border-gray-200 rounded-3xl mt-5 max-h-64 overflow-y-auto shadow-xl px-5 py-4"
            >
              {loadingLocation ? (
                <li className="px-4 py-3 text-gray-500 text-sm">Searching...</li>
              ) : locationSuggestions.length > 0 ? (
                locationSuggestions.map((s, idx) => (
                  <li
                    key={idx}
                    role="option"
                    onClick={() => handleSelectLocation(s)}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm text-gray-800 rounded-xl"
                  >
                    {s.display_name}
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-gray-500 text-sm">No results</li>
              )}
            </ul>
          )}
        </div>

        {/* Date (fixed width, no resize) */}
        <div className="px-5 py-3 shrink-0 basis-[220px]">
          <div className="w-[220px]">
            <CustomDatePicker
              value={formData.date}
              onChange={handleDateChange}
              placeholder="Add dates"
            />
          </div>
        </div>

        {/* Service (fixed width, truncate label) */}
        <div ref={serviceRef} className="relative shrink-0 basis-[260px]">
          <button
            type="button"
            onClick={() => setShowServiceMenu((v) => !v)}
            className="w-[260px] flex items-center gap-3 px-5 py-3 text-left overflow-hidden"
            aria-haspopup="menu"
            aria-expanded={showServiceMenu}
          >
            {selectedService ? (
              <>
                <selectedService.Icon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-900 truncate">{selectedService.label}</span>
              </>
            ) : (
              <>
                <PartyPopper className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-400 truncate">Service</span>
              </>
            )}
          </button>

          {showServiceMenu && (
            <div
              role="menu"
              aria-label="Choose a service"
              className="absolute left-1/2 -translate-x-1/2 z-30 mt-7 w-[600px] max-w-[92vw] rounded-3xl border border-gray-200 bg-white shadow-xl p-10"
            >
              {/* Close */}
              <button
                type="button"
                onClick={() => setShowServiceMenu(false)}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
                aria-label="Close services menu"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>

              <ul className="flex flex-wrap gap-4" role="none">
                {services.map(({ value, label, Icon }) => {
                  const active = formData.eventType === value;
                  return (
                    <li key={value} role="none">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleSelectService(value)}
                        className={[
                          "inline-flex items-center gap-2",
                          "rounded-full border px-5 py-3",
                          "text-base",
                          active
                            ? "border-gray-900 text-gray-900"
                            : "border-gray-300 text-gray-800 hover:border-gray-400",
                          "transition-colors",
                        ].join(" ")}
                      >
                        <Icon
                          className={
                            active ? "w-5 h-5 text-gray-900" : "w-5 h-5 text-gray-600"
                          }
                        />
                        <span className="whitespace-nowrap text-sm">{label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="px-3 py-2 md:py-0 md:pl-4 md:pr-2 flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-anzac-500 hover:bg-anzac-600 text-white px-6 py-3 rounded-full transition-all duration-300 shadow-md"
          >
            <Search className="w-5 h-5" />
            Search
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchForm;
