// vendor/components/LockedFeature.jsx
import React from 'react'
import { Lock, Clock, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const LockedFeature = ({ feature, description }) => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-amber-600" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {feature} Coming Soon!
        </h3>
        
        <div className="flex items-center justify-center gap-2 mb-4 text-amber-700">
          <Clock className="w-5 h-5" />
          <span className="font-medium">Application Under Process</span>
        </div>
        
        <p className="text-gray-600 mb-6">
          {description || `Your application is currently being reviewed. Once verified, you'll be able to access ${feature.toLowerCase()} and all other premium features.`}
        </p>

        {/* Progress indicator */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Submitted</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500 animate-spin" />
              <span>Under Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
              <span>Approved</span>
            </div>
          </div>
        </div>

        <Link
          to="/vendor/dashboard/profile"
          className="inline-flex items-center gap-2 px-6 py-3 bg-anzac-500 text-white rounded-lg font-medium hover:bg-anzac-600 transition-colors"
        >
          <CheckCircle className="w-5 h-5" />
          Check Verification Status
        </Link>

        <p className="text-xs text-gray-500 mt-4">
          Questions? Contact our support team for assistance.
        </p>
      </div>
    </div>
  )
}

export default LockedFeature
