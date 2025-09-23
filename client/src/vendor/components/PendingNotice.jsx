// src/vendor/components/PendingNotice.jsx
import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const PendingNotice = ({ title = 'Application under process' }) => {
  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 grid place-items-center">
          <Clock className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            Submitted successfully — status: pending; verification typically completes within 24 hours, then all features will be ready to use.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border p-3 bg-gray-50 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Submitted</span>
            </div>
            <div className="rounded-lg border p-3 bg-gray-50 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Pending</span>
            </div>
            <div className="rounded-lg border p-3 bg-gray-50 text-gray-600">
              Approved
            </div>
          </div>

          <div className="mt-4">
            <Link
              to="/vendor/dashboard/profile"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm"
            >
              Check status
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingNotice;
