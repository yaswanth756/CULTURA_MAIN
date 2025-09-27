import React, { useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  MapPin, 
  PhoneCall, 
  ShieldCheck, 
  Star 
} from 'lucide-react';
import axios from 'axios';
import { buildApiUrl } from '../../utils/api';

const BookingDetailsModal = ({ 
  booking, 
  isOpen, 
  onClose, 
  setSelectedBooking,
  setBookings, 
  bookings
}) => {
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);

  const titleId = useMemo(
    () => (booking?._id ? `booking-title-${booking._id}` : "booking-title"),
    [booking?._id]
  );
  const descId = useMemo(
    () => (booking?._id ? `booking-desc-${booking._id}` : "booking-desc"),
    [booking?._id]
  );

  // Scroll lock + focus mgmt + ESC close + basic focus trap
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => closeBtnRef.current?.focus(), 0);

    const handleKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const list = Array.from(focusables);
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        const active = document.activeElement;

        if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey, true);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKey, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !booking) return null;

  const {
    _id,
    id,
    bookingNumber,
    title,
    vendor,
    vendorVerified,
    vendorRating,
    vendorPhone,
    serviceDate,
    location,
    baseAmount,
    depositAmount,
    payableAmount,
    paymentStatus,
    bookingStatus,
    canCancel,
    imageUrl,
  } = booking;
  
  const bookingId = _id || id; // Handle both _id and id
  const letter = (vendor || "V").toString().trim().charAt(0).toUpperCase();
  const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
  
  const statusColor =
    String(bookingStatus || "").toLowerCase() === "confirmed"
      ? "bg-emerald-100 text-emerald-700"
      : String(bookingStatus || "").toLowerCase() === "cancelled"
      ? "bg-rose-100 text-rose-700"
      : "bg-amber-100 text-amber-700";
      
  const payColor =
    String(paymentStatus || "").toLowerCase() === "paid"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-blue-100 text-blue-700";

  const canPay =
    String(paymentStatus || "").toLowerCase() !== "paid" &&
    Number(payableAmount || 0) > 0;

  // 🚀 INSTANT UPDATE CANCEL FUNCTION
  const handleCancel = async () => {
    try {
      const updatedBooking = {
        ...booking,
        bookingStatus: 'cancelled',
        cancelledAt: new Date().toISOString(),
        canCancel: false
      };
      
      setSelectedBooking(updatedBooking);
      setBookings(prev => 
        prev.map(b => 
          (b._id === bookingId || b.id === bookingId) 
            ? updatedBooking 
            : b
        )
      );

      const response = await axios.patch(
        buildApiUrl(`/api/bookings/${bookingId}/cancel`)
      );
      
      if (response.data.success) {
        setTimeout(() => {
          onClose();
        }, 800);
        window.dispatchEvent(new Event('booking:updated'));
      }
      
    } catch (error) {
      console.error('Cancel booking failed:', error);
      setSelectedBooking(booking);
      setBookings(prev => 
        prev.map(b => 
          (b._id === bookingId || b.id === bookingId) 
            ? booking 
            : b
        )
      );
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const handlePay = () => {
    window.location.href = `/checkout?bookingId=${bookingId}`;
  };

  const overlay = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[1px]"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );

  const panel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="panel"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          ref={dialogRef}
          className="fixed inset-0 z-[80] grid place-items-center px-4 py-8"
          onClick={(e) => e.stopPropagation()}
          data-aos="fade-up"
        >
          <div className="w-full max-w-2xl rounded-2xl border bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-start gap-4 p-5 border-b">
              <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 border">
                {imageUrl ? (
                  <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full grid place-items-center text-blue-700 font-semibold">
                    {letter}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 id={titleId} className="text-[16px] font-semibold text-gray-900 truncate">
                  {title}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-gray-600">
                  <span className="font-medium text-gray-900">{vendor}</span>
                  {vendorVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  )}
                  {vendorRating ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2 py-0.5">
                      <Star className="h-3.5 w-3.5" />
                      {Number(vendorRating).toFixed(1)}
                    </span>
                  ) : null}
                  <span className="ml-auto font-mono text-gray-500">#{bookingNumber}</span>
                </div>
              </div>
              <button
                ref={closeBtnRef}
                onClick={onClose}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div id={descId} className="p-5 space-y-5">
              {/* When & Where */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border p-3" data-aos="fade-up">
                  <div className="text-[12px] text-gray-500 mb-1">When</div>
                  <div className="flex items-center gap-2 text-[14px] text-gray-900">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {new Date(serviceDate).toLocaleString("en-IN", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="rounded-xl border p-3" data-aos="fade-up" data-aos-delay="60">
                  <div className="text-[12px] text-gray-500 mb-1">Where</div>
                  <div className="flex items-center gap-2 text-[14px] text-gray-900">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="truncate">{location || "Not provided"}</span>
                  </div>
                </div>
              </div>

              {/* Status chips */}
              <div className="flex flex-wrap items-center gap-2" data-aos="fade-up">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] ${statusColor}`}>
                  Status: {String(bookingStatus || "pending").toUpperCase()}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] ${payColor}`}>
                  Payment: {String(paymentStatus || "pending").toUpperCase()}
                </span>
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-aos="fade-up">
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-[12px] text-gray-500">Base</div>
                  <div className="text-[15px] font-semibold text-gray-900">{formatINR(baseAmount)}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-[12px] text-gray-500">Deposit</div>
                  <div className="text-[15px] font-semibold text-emerald-700">{formatINR(depositAmount)}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-[12px] text-gray-500">Remaining</div>
                  <div className="text-[15px] font-semibold text-blue-700">{formatINR(payableAmount)}</div>
                </div>
              </div>

              {/* Contact */}
              <div className="rounded-xl border p-3 flex items-center justify-between" data-aos="fade-up">
                <div className="text-[13px] text-gray-600">
                  Vendor contact
                  <div className="text-[14px] text-gray-900">{vendorPhone || "N/A"}</div>
                </div>
                {vendorPhone && (
                  <a
                    href={`tel:${vendorPhone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <PhoneCall className="h-4 w-4" />
                    Call vendor
                  </a>
                )}
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-5 border-t flex flex-wrap gap-2 justify-end" data-aos="fade-up">
              {canCancel && bookingStatus !== 'cancelled' && (
                <button
                  onClick={handleCancel}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Cancel booking
                </button>
              )}
              {canPay && (
                <button
                  onClick={handlePay}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Pay now
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(
    <>
      {overlay}
      {panel}
    </>,
    document.body
  );
};

export default BookingDetailsModal;
