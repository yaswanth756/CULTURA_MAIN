// src/vendor/components/BookingDetailsModal.jsx
import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Hash, User, Phone, MapPin, CalendarDays, IndianRupee, CreditCard } from 'lucide-react'

const inr = (n, c = 'INR') => (c === 'INR' ? `₹${(n || 0).toLocaleString('en-IN')}` : `${c} ${(n || 0).toLocaleString()}`)
const dt = (d) => new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

const BookingDetailsModal = ({ booking, onClose, onUpdateStatus, onUpdatePayment }) => {
  const [status, setStatus] = useState(booking.status)
  const [payment, setPayment] = useState(booking.paymentStatus)

  const total = booking.pricing?.baseAmount || 0
  const deposit = booking.pricing?.depositeAmount || 0
  const due = Math.max(total - deposit, 0)

  const handleSave = () => {
    if (status !== booking.status) onUpdateStatus(status)
    if (payment !== booking.paymentStatus) onUpdatePayment(payment)
    onClose()
  }

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 p-4 md:p-8 grid place-items-center" onClick={handleBackdrop}>
      <div className="bg-white w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h4 className="font-semibold text-gray-900">Booking details</h4>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Booking meta */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Hash className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">{booking.bookingNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-800">{booking.customer?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-800">{booking.customer?.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-800">{booking.location?.address || '-'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <span className="text-gray-800">{dt(booking.serviceDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IndianRupee className="w-4 h-4 text-gray-500" />
                <span className="text-gray-800">
                  Total: <span className="font-medium">{inr(total, booking.pricing?.currency)}</span> • Deposit: {inr(deposit)} • Due: {inr(due)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <select
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                  className="border rounded-lg px-2 py-1 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Booking status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Payment status</label>
              <select
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50">
              Close
            </button>
            <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-black">
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default BookingDetailsModal
