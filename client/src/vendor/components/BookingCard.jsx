import React from "react";
import {
  Hash,
  User,
  Phone,
  MapPin,
  CalendarDays,
  IndianRupee,
  CreditCard,
  CheckCircle2,
  Ban,
  CircleCheckBig,
  Image as ImageIcon,
  Plane,
} from "lucide-react";

// ============================================================================
// Shared Utilities & Components
// ============================================================================

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  confirmed: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/20",
  completed: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  cancelled: "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20",
};

const paymentStyles = {
  paid: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  refunded: "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20",
};

const inr = (n, c = "INR") =>
  c === "INR" ? `₹${(n || 0).toLocaleString("en-IN")}` : `${c} ${(n || 0).toLocaleString()}`;

// Helper to format date: shows only YYYY-MM-DD
const formatDate = (d) => d ? d.split('T')[0] : '—';

const Chip = ({ children, className }) => (
  <span
    className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${className}`}
  >
    {children}
  </span>
);

const StatusBadge = ({ status }) => (
  <Chip className={statusStyles[status] || statusStyles.pending}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </Chip>
);

const PaymentBadge = ({ status }) => (
  <Chip className={paymentStyles[status] || paymentStyles.pending}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </Chip>
);

const PrimaryBtn = ({ onClick, icon: Icon, children }) => (
  <button
    onClick={onClick}
    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200"
  >
    {Icon && <Icon size={16} />} {children}
  </button>
);

const GhostBtn = ({ onClick, icon: Icon, children }) => (
  <button
    onClick={onClick}
    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all duration-200"
  >
    {Icon && <Icon size={16} />} {children}
  </button>
);

const QuickActions = ({ status, onUpdateStatus }) => {
  if (status === "pending") {
    return (
      <div className="flex flex-col md:flex-row gap-3 w-full">
        <PrimaryBtn onClick={() => onUpdateStatus("confirmed")} icon={CheckCircle2}>
          Confirm Booking
        </PrimaryBtn>
        <GhostBtn onClick={() => onUpdateStatus("cancelled")} icon={Ban}>
          Cancel
        </GhostBtn>
      </div>
    );
  }
  if (status === "confirmed") {
    return (
      <div className="flex flex-col md:flex-row gap-3 w-full">
        <PrimaryBtn onClick={() => onUpdateStatus("completed")} icon={CircleCheckBig}>
          Mark Completed
        </PrimaryBtn>
        <GhostBtn onClick={() => onUpdateStatus("cancelled")} icon={Ban}>
          Cancel
        </GhostBtn>
      </div>
    );
  }
  return null;
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 text-sm">
    <Icon size={18} className="text-gray-500 flex-shrink-0" />
    <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline gap-1">
      <span className="font-medium text-gray-600">{label}:</span>
      <span className="font-semibold text-gray-900">{value || "—"}</span>
    </div>
  </div>
);

// ============================================================================
// Main Booking Card Component
// ============================================================================

const BookingCard = ({ booking, onUpdateStatus }) => {
  const {
    bookingNumber,
    customer,
    location,
    serviceDate,
    pricing,
    status,
    paymentStatus,
    imageUrl,
  } = booking;

  const total = pricing?.baseAmount || 0;
  const deposit = pricing?.depositeAmount || 0;
  const due = Math.max(total - deposit, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-gray-50 border-b border-gray-200">
        <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt="Service" className="w-full h-full object-cover" />
          ) : (
            <Plane size={36} className="text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Hash size={18} className="text-gray-500" />
              <span className="truncate">{bookingNumber}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={status} />
              <PaymentBadge status={paymentStatus} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <MapPin size={16} />
            <span className="truncate">{location?.address || "Location not specified"}</span>
          </p>
        </div>
      </div>

      {/* Main Details Section */}
      <div className="p-5 grid gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailRow icon={User} label="Customer" value={customer?.name} />
          <DetailRow icon={Phone} label="Phone" value={customer?.phone} />
          <DetailRow
            icon={CalendarDays}
            label="Date"
            value={formatDate(serviceDate)}
          />
          <DetailRow
            icon={MapPin}
            label="Service Address"
            value={location?.address}
          />
        </div>

        {/* Pricing Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-lg bg-anzac-50 text-anzac-600 border border-anzac-200">
          <div className="flex items-center gap-3">
            <IndianRupee size={24} />
            <span className="text-lg font-semibold">Total Price</span>
          </div>
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-2xl font-bold">
              {inr(total, pricing?.currency)}
            </span>
            <div className="flex gap-2 text-sm text-anzac-600 font-medium">
              <span>Deposit: {inr(deposit, pricing?.currency)}</span>
              <span className="text-gray-500">•</span>
              <span>Due: {inr(due, pricing?.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="p-5">
        <QuickActions status={status} onUpdateStatus={onUpdateStatus} />
      </div>
    </div>
  );
};

export default BookingCard;