import React from 'react'
import { useOutletContext } from 'react-router-dom'
import PendingNotice from '../components/PendingNotice'

const AnalyticsPage = () => {
  const { vendorData } = useOutletContext()
  
  if (!vendorData.vendorInfo.verified) {
    return (
      <PendingNotice/>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p>Actual analytics content goes here when verified...</p>
      </div>
    </div>
  )
}

export default AnalyticsPage