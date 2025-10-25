// src/vendor/components/BookingsTable.jsx
import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  CalendarDays, 
  MoreVertical, 
  CheckCircle2, 
  Ban, 
  CircleCheckBig,
  Search,
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border border-blue-200",
  completed: "bg-green-50 text-green-700 border border-green-200",
  cancelled: "bg-gray-100 text-gray-600 border border-gray-300",
};

const paymentStyles = {
  paid: "bg-green-50 text-green-700 border border-green-200",
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  refunded: "bg-gray-100 text-gray-600 border border-gray-300",
};

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  completed: CheckCircle2,
  cancelled: XCircle,
};

const paymentIcons = {
  paid: CheckCircle2,
  pending: Clock,
  refunded: Ban,
};

const StatusBadge = ({ status }) => {
  const Icon = statusIcons[status] || Clock;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wide">
        Booking
      </span>
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-semibold whitespace-nowrap ${statusStyles[status] || statusStyles.pending}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
};

const PaymentBadge = ({ status }) => {
  const Icon = paymentIcons[status] || Clock;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wide">
        Payment
      </span>
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-semibold whitespace-nowrap ${paymentStyles[status] || paymentStyles.pending}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
};

const formatDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const inr = (n, c = "INR") => c === "INR" ? `₹${(n || 0).toLocaleString("en-IN")}` : `${c} ${(n || 0).toLocaleString()}`;

const ActionMenu = ({ booking, onUpdateStatus }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { status } = booking;

  const actions = [];
  
  if (status === 'pending') {
    actions.push(
      { label: 'Confirm Booking', icon: CheckCircle2, onClick: () => onUpdateStatus('confirmed'), variant: 'primary' },
      { label: 'Cancel', icon: Ban, onClick: () => onUpdateStatus('cancelled'), variant: 'danger' }
    );
  } else if (status === 'confirmed') {
    actions.push(
      { label: 'Mark Completed', icon: CircleCheckBig, onClick: () => onUpdateStatus('completed'), variant: 'primary' },
      { label: 'Cancel', icon: Ban, onClick: () => onUpdateStatus('cancelled'), variant: 'danger' }
    );
  }

  if (actions.length === 0) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-20">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => { action.onClick(); setIsOpen(false); }}
                className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2.5 hover:bg-gray-50 transition-colors ${
                  action.variant === 'danger' ? 'text-red-600' : action.variant === 'primary' ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Mobile Card Component
const BookingCard = ({ booking, onUpdateStatus }) => {
  const total = booking.pricing?.baseAmount || 0;
  const deposit = booking.pricing?.depositeAmount || 0;
  const due = Math.max(total - deposit, 0);
  
  const StatusIcon = statusIcons[booking.status] || Clock;
  const PaymentIcon = paymentIcons[booking.paymentStatus] || Clock;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-bold text-gray-900">#{booking.bookingNumber}</div>
          <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {formatDate(booking.serviceDate)}
          </div>
        </div>
        <ActionMenu booking={booking} onUpdateStatus={(st) => onUpdateStatus(booking._id, st)} />
      </div>

      {/* Customer */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-gray-500" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-gray-900">{booking.customer?.name}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3" />
            {booking.customer?.phone}
          </div>
        </div>
      </div>

      {/* Location */}
      {booking.location?.address && (
        <div className="flex items-start gap-2 text-xs text-gray-600">
          <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{booking.location.address}</span>
        </div>
      )}

      {/* Amount */}
      <div className="flex items-center justify-between py-2 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <IndianRupee className="w-4 h-4 text-gray-600" />
          <span className="text-base font-bold text-gray-900">{inr(total, booking.pricing?.currency)}</span>
        </div>
        {due > 0 && (
          <span className="text-xs text-amber-600 font-medium">Due: {inr(due, booking.pricing?.currency)}</span>
        )}
      </div>

      {/* Badges with Clear Labels */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
        <div>
          <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Booking Status
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold w-full justify-center ${statusStyles[booking.status] || statusStyles.pending}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>
        <div>
          <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Payment
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold w-full justify-center ${paymentStyles[booking.paymentStatus] || paymentStyles.pending}`}>
            <PaymentIcon className="w-3.5 h-3.5" />
            {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

const BookingsTable = ({ bookings, onUpdateStatus, totalCount }) => {
  if (bookings.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <Search className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
        </div>
        <p className="text-gray-900 font-semibold text-base sm:text-lg">No results found</p>
        <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile: Card Layout */}
      <div className="lg:hidden space-y-3">
        {bookings.map((booking) => (
          <BookingCard 
            key={booking._id} 
            booking={booking} 
            onUpdateStatus={onUpdateStatus} 
          />
        ))}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Service Date
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => {
                const total = booking.pricing?.baseAmount || 0;
                const deposit = booking.pricing?.depositeAmount || 0;
                const due = Math.max(total - deposit, 0);

                return (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-gray-900">#{booking.bookingNumber}</div>
                        <div className="text-xs text-gray-500">{formatDate(booking.createdAt)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900">{booking.customer?.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            {booking.customer?.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        {formatDate(booking.serviceDate)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-600 flex items-start gap-2 max-w-[220px]">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{booking.location?.address || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-gray-900">{inr(total, booking.pricing?.currency)}</div>
                        {due > 0 && (
                          <div className="text-xs text-amber-600 font-medium">Due: {inr(due, booking.pricing?.currency)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <StatusBadge status={booking.status} />
                        <PaymentBadge status={booking.paymentStatus} />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <ActionMenu booking={booking} onUpdateStatus={(st) => onUpdateStatus(booking._id, st)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs sm:text-sm text-gray-500 text-center py-2">
        Showing <span className="font-semibold text-gray-700">{bookings.length}</span> of <span className="font-semibold text-gray-700">{totalCount}</span> bookings
      </div>
    </div>
  );
};

export default BookingsTable;
