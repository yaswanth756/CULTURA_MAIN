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
} from "lucide-react";
import CustomDatePicker from "./CustomDatePicker";

const SearchForm = () => {
  const navigate = useNavigate();

  // Keep date empty so placeholder "Add dates" shows
  const { formData, setFormData } = useEventContext();

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [showServiceMenu, setShowServiceMenu] = useState(false);

  const locationRef = useRef(null);
  const serviceRef = useRef(null);
  const debounceTimer = useRef(null);

  // Services for chip menu
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
  
    if (formData.location) {
      params.append("location", formData.location);
    }
    if (formData.date) {
      params.append("date", formData.date);
    }
    if (formData.eventType) {
      params.append("servicetype", formData.eventType);
    }
  
    const q = `/browse?${params.toString()}`;
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

            {/* Updated placeholder to reflect vendor search in area */}
            <input
              type="text"
              name="location"
              placeholder="Service Needed In"
              value={formData.location}
              onChange={handleLocationChange}
              className="flex-1 min-w-0 bg-transparent placeholder:text-gray-400 text-gray-900 outline-none truncate"
              autoComplete="on"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
              aria-controls="location-suggestions"
            />
          </div>

          {showSuggestions && (
            <ul
              id="location-suggestions"
              role="listbox"
              className="absolute z-20 w-[500px] bg-white border border-gray-200 rounded-3xl mt-5 max-h-64 overflow-y-auto shadow-xl px-5 py-4"
            >
              {loadingLocation ? (
                <li className="px-4 py-3 text-gray-500 text-sm">Searching...</li>
              ) : locationSuggestions.length > 0 ? (
                locationSuggestions.map((s, idx) => (
                  <li
                    key={idx}
                    role="option"
                    onClick={() => handleSelectLocation(s)}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm text-gray-800 rounded-xl truncate"
                    title={s.display_name}
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

        {/* Date (fixed width on md+, full on mobile) */}
        <div className="px-5 py-3 shrink-0 md:basis-[220px]">
          <div className="w-full md:w-[200px]">
            <CustomDatePicker
              value={formData.date}
              onChange={handleDateChange}
              placeholder="Add dates"
            />
          </div>
        </div>

        {/* Service (show icon only on mobile, label truncates on md+) */}
        <div ref={serviceRef} className="relative shrink-0 md:basis-[260px]">
        <button
  type="button"
  onClick={() => setShowServiceMenu((v) => !v)}
  className="w-full md:w-[200px] px-5 py-3 text-left overflow-hidden"
  aria-haspopup="menu"
  aria-expanded={showServiceMenu}
>
  <div className="inline-flex items-center gap-3 align-middle">
    {selectedService ? (
      <selectedService.Icon className="w-5 h-5 text-gray-500 flex-shrink-0" />
    ) : (
      <PartyPopper className="w-5 h-5 text-gray-500 flex-shrink-0" />
    )}

    {/* Label */}
    {selectedService ? (
      <span className="hidden md:block text-gray-900 truncate max-w-[160px]">
        {selectedService.label}
      </span>
    ) : (
      <span className="hidden md:block text-gray-400 truncate max-w-[160px]">
        Service
      </span>
    )}
  </div>
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
                          "max-w-full"
                        ].join(" ")}
                      >
                        <Icon className={active ? "w-5 h-5 text-gray-900" : "w-5 h-5 text-gray-600"} />
                        <span className="truncate max-w-[200px]" title={label}>{label}</span>
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
            {/* Hide text on mobile, keep accessible; show from md+ */}
            <span className="sr-only md:not-sr-only">Search</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchForm;
