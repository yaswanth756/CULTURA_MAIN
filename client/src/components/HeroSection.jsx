import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Locate, CalendarDays, ChevronDown, Cake } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AOS from "aos";
import "aos/dist/aos.css";

const HeroSection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    location: "",
    date: null,
    eventType: "",
  });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const locationRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = async (e) => {
    const value = e.target.value;
    setFormData({ ...formData, location: value });

    if (value.length > 2) {
      setLoadingLocation(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}&limit=5&addressdetails=1`
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
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          setFormData({
            ...formData,
            location:
              data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
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
      `/browse?location=${encodeURIComponent(formData.location)}&date=${
        formData.date ? formData.date.toISOString().split("T")[0] : ""
      }&eventType=${formData.eventType}`
    );
  };

  return (
    <section
      className="relative h-[90vh] flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `url('https://images.pexels.com/photos/547114/pexels-photo-547114.jpeg')`,
      }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <div
        className="relative z-10 text-center text-white px-4"
        data-aos="fade-up"
        data-aos-duration="1000"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
          Plan Your Perfect Event
        </h1>
        <p className="text-lg md:text-xl mb-10 opacity-90">
          Venues • Catering • Photography • Décor • Cakes & More
        </p>

        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-4 p-6 max-w-5xl mx-auto"
          data-aos="zoom-in"
          data-aos-duration="1200"
        >
          {/* Location */}
          <div ref={locationRef} className="relative flex-1">
            <div className="flex items-center bg-white rounded-lg border pl-3 pr-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                name="location"
                placeholder="Search location"
                value={formData.location}
                onChange={handleLocationChange}
                className="flex-1 px-3 py-3 border-none outline-none text-gray-800"
                disabled={loadingLocation}
              />
              <button
                type="button"
                onClick={handleCurrentLocation}
                disabled={loadingLocation}
                className="p-2 text-gray-500 hover:text-anzac-500 disabled:opacity-50"
                title="Use current location"
              >
                <Locate className="w-5 h-5" />
              </button>
            </div>
            {showSuggestions && (
              <ul className="absolute z-20 w-full bg-white border rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
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
          </div>

          {/* Date Picker */}
          <div className="relative flex-1">
            <div className="flex items-center bg-white rounded-lg border pl-3 pr-3">
              <CalendarDays className="w-5 h-5 text-gray-500" />
              <DatePicker
                selected={formData.date}
                onChange={(date) => setFormData({ ...formData, date })}
                minDate={new Date()}
                placeholderText="Select Date"
                className="flex-1 px-3 py-3 border-none outline-none text-gray-800 bg-transparent"
              />
            </div>
          </div>

          {/* Event Type */}
          <div className="relative flex-1">
            <div className="flex items-center bg-white rounded-lg border pl-3 pr-3">
              <Cake className="w-5 h-5 text-gray-500" />
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
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="flex items-center gap-2 bg-anzac-500 hover:bg-anzac-600 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg"
          >
            <Search className="w-5 h-5" />
            Search
          </button>
        </form>
      </div>
    </section>
  );
};

export default HeroSection;
