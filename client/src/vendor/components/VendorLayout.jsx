import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Bell } from 'lucide-react';
import VendorSidebar from './VendorSidebar';
import { useVendor } from '../context/VendorContext';

const VendorLayout = () => {
  const { vendor, isLoading } = useVendor();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading || !vendor) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500 text-lg">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <VendorSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        vendorData={vendor}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-6 h-[104px] flex items-center justify-between">
            <div>
              <div className="text-lg text-gray-500">Welcome</div>
              <div className="text-medium font-medium text-gray-900">
                {vendor.profile.firstName} • {vendor.profile.businessName}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                <Bell className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-full bg-gray-900 text-white grid place-items-center text-medium font-medium mr-3">
                {vendor.profile.firstName?.[0] || 'V'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6">
            <Outlet context={{ vendorData: vendor }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
