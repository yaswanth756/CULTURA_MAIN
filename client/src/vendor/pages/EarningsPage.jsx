import React from 'react'
import { useOutletContext } from 'react-router-dom'
import LockedFeature from '../components/LockedFeature'

const EarningsPage = () => {
  const { vendorData } = useOutletContext()
  
  if (!vendorData.vendorInfo.verified) {
    return (
      <LockedFeature 
        feature="Earnings Dashboard"
        description="Track your income, view payment history, and manage your financial data. Get detailed insights into your business performance."
      />
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Earnings</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p>Actual earnings content goes here when verified...</p>
      </div>
    </div>
  )
}

export default EarningsPage
