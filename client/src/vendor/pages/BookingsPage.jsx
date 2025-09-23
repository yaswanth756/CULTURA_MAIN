import React from 'react'
import { useOutletContext } from 'react-router-dom'
import LockedFeature from '../components/LockedFeature'

const BookingsPage = () => {
  const { vendorData } = useOutletContext()
  
  if (!vendorData.vendorInfo.verified) {
    return (
      <LockedFeature 
        feature="Bookings Management"
        description="View and manage all your bookings in one place. Track upcoming events, communicate with clients, and organize your schedule."
      />
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Bookings</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p>Actual bookings content goes here when verified...</p>
      </div>
    </div>
  )
}

export default BookingsPage