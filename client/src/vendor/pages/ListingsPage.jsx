import React from 'react'
import { useOutletContext } from 'react-router-dom'
import LockedFeature from '../components/LockedFeature'

const ListingsPage = () => {
  const { vendorData } = useOutletContext()
  
  if (!vendorData.vendorInfo.verified) {
    return (
      <LockedFeature 
        feature="Add New Listing"
        description="Create and manage your service listings to attract more customers. Upload photos, set pricing, and showcase your work."
      />
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Listing</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p>Actual listings content goes here when verified...</p>
      </div>
    </div>
  )
}

export default ListingsPage
