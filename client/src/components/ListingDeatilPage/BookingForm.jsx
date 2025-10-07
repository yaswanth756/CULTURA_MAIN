import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Star, Phone, MapPin, Calendar as CalendarIcon, X, Loader2 } from "lucide-react";
import MiniCalendar from "../MiniCalendar";
import { useNavigate } from 'react-router-dom';
import { useEventContext } from "../../context/EventContext";
import { useAuth } from "../../context/AuthContext";
const priceTypeLabels = {
  fixed: "",
  per_person: "/ person",
  per_event: "/ event",
  per_day: "/ day",
  per_hour: "/ hour",
};

// Debounce function for API calls
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// OpenStreetMap Nominatim API for Indian locations
const searchLocations = async (query) => {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=5&addressdetails=1&countrycodes=in`
    );
    
    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    
    return data.map((item, index) => ({
      id: item.place_id || index,
      name: item.name || item.display_name.split(',')[0],
      description: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      address: item.address || {},
      type: item.type,
      city: item.address?.city || item.address?.town || item.address?.village,
      state: item.address?.state,
      postcode: item.address?.postcode,
      country: item.address?.country
    }));
  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
};

const BookingForm = ({ listing }) => {
  const { setModelOpen } = useEventContext();
  const { user } = useAuth();

const navigate = useNavigate();
  const bookingRef = useRef(null);
  const calendarRef = useRef(null);
  const locationRef = useRef(null);
  
  // Calendar states
  const [eventDate, setEventDate] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarViewMonth, setCalendarViewMonth] = useState(new Date());
  
  // Location states
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const formattedPrice = useMemo(() => {
    if (!listing?.price?.base) return "";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(listing.price.base);
  }, [listing?.price?.base]);

  const depositAmount = useMemo(() => {
    if (!listing?.price?.base) return "";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(listing.price.base * 0.1);
  }, [listing?.price?.base]);

  const today = useMemo(() => new Date(), []);

  // Debounced location search
  const debouncedLocationSearch = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 2) {
        setLocationSuggestions([]);
        setLocationLoading(false);
        return;
      }

      setLocationLoading(true);
      try {
        const results = await searchLocations(query);
        setLocationSuggestions(results);
      } catch (error) {
        console.error('Search failed:', error);
        setLocationSuggestions([]);
      } finally {
        setLocationLoading(false);
      }
    }, 300),
    []
  );

  // Handle location input change
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocationQuery(value);
    setSelectedLocation(null);
    setLocationOpen(true);
    debouncedLocationSearch(value);
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setLocationQuery(location.description);
    setLocationOpen(false);
    setLocationSuggestions([]);
  };

  // Clear location
  const clearLocation = () => {
    setLocationQuery('');
    setSelectedLocation(null);
    setLocationSuggestions([]);
    setLocationOpen(false);
  };

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Calendar click outside
      if (
        calendarOpen &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target)
      ) {
        setCalendarOpen(false);
      }

      // Location click outside
      if (
        locationOpen &&
        locationRef.current &&
        !locationRef.current.contains(event.target)
      ) {
        setLocationOpen(false);
      }
    };

    if (calendarOpen || locationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [calendarOpen, locationOpen]);

  const scrollToBooking = () => {
    if (bookingRef.current) {
      const yOffset = -100;
      const y =
        bookingRef.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!eventDate) {
      alert("Please select an event date!");
      return;
    }
    if (!selectedLocation && !locationQuery) {
      alert("Please enter event location!");
      return;
    }

    if(!user){
      setModelOpen(true);
      return;
    }

    // Create booking data
    const baseAmountRupees = listing.price.base; // This is in rupees
    const depositAmountRupees = Math.ceil(baseAmountRupees * 0.1); // 10% deposit in rupees
  
    // Create booking data (keep amounts in rupees for display)
    const bookingData = {
      listingId: listing._id,
      vendorId: listing.vendorId._id,
      eventDate: eventDate.toISOString(),
      location: selectedLocation?.description || locationQuery,
      coordinates: selectedLocation ? [selectedLocation.longitude, selectedLocation.latitude] : null,
      amount: baseAmountRupees, // Keep in rupees for display
      depositAmount: depositAmountRupees, // Keep in rupees for display
      priceType: listing.price.type,
      serviceTitle: listing.title,
      vendorName: listing.vendorId.profile?.businessName || 'Vendor'
    };
  
    // Navigate to secure payment page with booking data
    navigate(`/securepayment/${listing._id}`, { 
      state: bookingData 
    });
  };

  return (
    <>
      {/* Desktop Booking Sidebar */}
      <div className="lg:sticky lg:top-[14%] bg-white  border-gray-200 border rounded-3xl p-7 space-y-5 md:w-[440px] shadow-sm">
        {/* Price Header */}
        <div className="flex items-center justify-between border-b pb-5">
          <div>
            <p className="text-sm text-gray-500">Starting from</p>
            <p className="text-3xl font-bold text-gray-900">
              {formattedPrice}{" "}
              <span className="text-sm">
                {priceTypeLabels[listing?.price?.type]}
              </span>
            </p>
            <p className="text-[12px] text-gray-500">
              Pay {depositAmount} now (10% deposit)
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 text-yellow-500 " />
            <span className="font-semibold text-gray-900">
              {listing.ratings?.average || 0}
            </span>
            <span className="text-sm text-gray-500">
              ({listing.ratings?.count || 0})
            </span>
          </div>
        </div>

        {/* Vendor Info */}
        {listing.vendorId && (
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <img
              src={
                listing.vendorId.profile?.avatar ||
                "https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-623.jpg?ga=GA1.1.530000802.1735748529&semt=ais_hybrid&w=740&q=80"
              }
              alt={listing.vendorId.profile?.businessName || "Vendor"}
              className="w-14 h-14 rounded-full"
              loading="lazy"
            />
            <div>
              <h3 className="font-semibold text-gray-900">
                {listing.vendorId.profile?.businessName || "Vendor"}
              </h3>
              <p className="text-sm text-gray-600">
                {listing.vendorId.vendorInfo?.verified && "✓ Verified"}
              </p>
            </div>
          </div>
        )}

        {/* Call Button */}
        {listing.vendorId?.phone && (
          <a
            href={`tel:${listing.vendorId.phone}`}
            className="w-full flex pl-2 gap-2   py-3 font-medium transition-all duration-200 text-gray-800"
            aria-label="Call vendor"
          >
            <Phone className="w-5 h-5 text-green-400" />
            {listing.vendorId.phone}
          </a>
        )}

        {/* Booking Form */}
        <form
          ref={bookingRef}
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!eventDate) {
              alert("Please select an event date!");
              return;
            }
            if (!selectedLocation && !locationQuery) {
              alert("Please enter event location!");
              return;
            }
            alert(`Booking request submitted for ${eventDate.toDateString()} at ${selectedLocation?.description || locationQuery}!`);
          }}
        >
          {/* Event Date */}
          <div className="relative" ref={calendarRef}>
            <label className="text-sm font-medium text-gray-700">
              Event Date *
            </label>
            <div
              className="flex items-center border border-gray-300 rounded-xl px-3 py-3 focus-within:ring-2  bg-white cursor-pointer text-gray-400"
              onClick={() => {
                setCalendarOpen((v) => !v);
                if (!calendarOpen) {
                  setCalendarViewMonth(eventDate || today);
                }
              }}
            >
              <CalendarIcon className="w-4 h-4 text-gray-400 mr-3" />
              <span className="flex-1 text-gray-500">
                {eventDate
                  ? eventDate.toDateString()
                  : "Select event date"}
              </span>
            </div>

            {calendarOpen && (
              <div className="absolute z-50 mt-2">
                <MiniCalendar
                  viewMonth={calendarViewMonth}
                  setViewMonth={setCalendarViewMonth}
                  selected={eventDate}
                  onPick={(d) => {
                    setEventDate(d);
                    setCalendarOpen(false);
                  }}
                  today={today}
                />
              </div>
            )}
          </div>

          {/* Event Location with Autocomplete */}
          <div className="relative" ref={locationRef}>
            <label className="text-sm font-medium text-gray-700">
              Event Location *
            </label>
            <div className="relative">
              <div className="flex items-center border border-gray-300 rounded-xl px-3 py-3  bg-white">
                <MapPin className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search city, place, or pincode..."
                  className="flex-1 outline-none text-gray-900 placeholder-gray-500"
                  value={locationQuery}
                  onChange={handleLocationChange}
                  onFocus={() => {
                    if (locationSuggestions.length > 0) {
                      setLocationOpen(true);
                    }
                  }}
                  required
                />
                {locationLoading && (
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin mr-2" />
                )}
                {locationQuery && (
                  <button
                    type="button"
                    onClick={clearLocation}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Location Suggestions Dropdown */}
              {locationOpen && locationSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {locationSuggestions.map((location) => (
                    <button
                      key={location.id}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
                      onClick={() => handleLocationSelect(location)}
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">
                            {location.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {location.description}
                          </p>
                          {location.postcode && (
                            <p className="text-xs text-gray-400 mt-1">
                              PIN: {location.postcode}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reserve Button */}
          <button
            type="submit"
            className="w-full bg-anzac-500 hover:bg-anzac-600 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            onClick={handleFormSubmit}
          >
            Reserve Now
          </button>

          <p className="text-xs text-gray-500 text-center border-t pt-4">
            Free · cancellation · available
          </p>
        </form>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white border-t shadow-lg">
        <div className="px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-gray-500">From</div>
              <div className="text-lg font-bold text-gray-900 leading-tight">
                {formattedPrice}
              </div>
              <div className="text-xs text-gray-500">
                Pay {depositAmount} now
              </div>
            </div>
            <button
              onClick={scrollToBooking}
              className="flex-1 max-w-[160px] bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all duration-200"
              aria-label="Reserve now"
            >
              Reserve Now
            </button>
          </div>
        </div>
      
      </div>
    </>
  );
};

export default BookingForm;
