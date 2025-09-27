import React, { useState, useEffect, useMemo, useCallback } from "react"; // ✅ Added useCallback
import axios from "axios";
import { buildApiUrl } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { Calendar, XCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

// Component imports
import BookingCard from "./BookingCard";
import BookingFilters from "./BookingFilters";
import BookingDetailsModal from "./BookingDetailsModal";
import BookingSkeleton from "./BookingSkeleton";
import ReviewModal from "./ReviewModal";

const BookingsPanel = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);

  // AOS initialization
  useEffect(() => {
    AOS.init({
      duration: 350,
      easing: "ease-out",
      once: true,
      offset: 40,
    });
  }, []);

  // ✅ OPTIMIZED: Only refresh AOS when bookings change
  useEffect(() => {
    const timer = setTimeout(() => {
      AOS.refresh();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [bookings]);

  const fetchBookings = async (status = "all") => {
    if (!user?._id) return;
    try {
      setLoading(true);
      setError(null);
      const params = { status, page: 1, limit: 50 };
      const res = await axios.get(buildApiUrl(`/api/bookings/user/${user._id}`), { params });
      console.log(res.data.data.bookings);
      if (res.data.success) setBookings(res.data.data.bookings || []);
      else setError("Failed to fetch bookings");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchBookings(activeFilter);
  }, [user?._id, activeFilter]);

  // Refresh after actions
  useEffect(() => {
    const handler = () => {
      if (user?._id) fetchBookings(activeFilter);
    };
    window.addEventListener("booking:updated", handler);
    return () => window.removeEventListener("booking:updated", handler);
  }, [activeFilter, user?._id]);

  // Filter bookings
  const filtered = useMemo(() => {
    if (activeFilter === "all") return bookings;
    if (activeFilter === "upcoming") {
      return bookings.filter(
        (b) =>
          ["pending", "confirmed"].includes(String(b.bookingStatus || "").toLowerCase()) &&
          new Date(b.serviceDate) >= new Date()
      );
    }
    return bookings.filter((b) => String(b.bookingStatus || "").toLowerCase() === activeFilter);
  }, [bookings, activeFilter]);

  // Count for filters
  const countFor = useCallback((key) => {
    if (key === "all") return bookings.length;
    if (key === "upcoming") {
      return bookings.filter(
        (b) =>
          ["pending", "confirmed"].includes(String(b.bookingStatus || "").toLowerCase()) &&
          new Date(b.serviceDate) >= new Date()
      ).length;
    }
    return bookings.filter((b) => String(b.bookingStatus || "").toLowerCase() === key).length;
  }, [bookings]);

  // ✅ OPTIMIZED: Stable event handlers
  const handleView = useCallback((booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  }, []);

  const handleReview = useCallback((booking) => {
    setReviewBooking(booking);
    setShowReviewModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedBooking(null);
  }, []);

  const closeReviewModal = useCallback(() => {
    setShowReviewModal(false);
    setReviewBooking(null);
  }, []);

  const handleReviewSubmitted = useCallback((bookingId) => {
    fetchBookings(activeFilter);
    closeReviewModal();
    
    // Check for next pending review
    const nextPendingReview = bookings.find(b => 
      b.id !== bookingId && 
      b.canReview && 
      b.needsReviewPrompt
    );
    
    if (nextPendingReview) {
      setReviewBooking(nextPendingReview);
      setShowReviewModal(true);
    }
  }, [activeFilter, bookings]);

  // ✅ OPTIMIZED: Stable formatINR function
  const formatINR = useCallback((n) => `₹${Number(n || 0).toLocaleString()}`, []);

  return (
    <div className="max-w-6xl mx-auto p-6" data-aos="fade-up">
      <h1 className="text-[22px] font-semibold text-gray-900 mb-5 tracking-tight">
        My Bookings
      </h1>

      {/* Filters */}
      <BookingFilters 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        countFor={countFor}
      />

      {/* Bookings List */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden" data-aos="fade-up" data-aos-delay="80">
        {loading ? (
          <BookingSkeleton />
        ) : error ? (
          <div className="p-12 text-center" data-aos="fade-up">
            <XCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchBookings(activeFilter)}
              className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-14 text-center" data-aos="fade-up">
            <div className="w-14 h-14 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-[15px] font-medium text-gray-900 mb-1">No bookings found</h3>
            <p className="text-gray-500 text-[13px]">Try a different filter</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((booking, idx) => (
              <BookingCard
                key={booking._id || booking.id}
                booking={booking}
                index={idx}
                onView={handleView}
                onReview={handleReview}
                formatINR={formatINR}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Modals */}
      <BookingDetailsModal 
        booking={selectedBooking} 
        isOpen={showModal} 
        onClose={closeModal}
        setSelectedBooking={setSelectedBooking}
        setBookings={setBookings}
        bookings={bookings}
      />

      <ReviewModal 
        booking={reviewBooking}
        isOpen={showReviewModal}
        onClose={closeReviewModal}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default BookingsPanel;
