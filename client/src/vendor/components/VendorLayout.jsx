import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Bell, User, PlusCircle, Calendar, DollarSign, BarChart3 } from 'lucide-react';
import VendorSidebar from './VendorSidebar';
import { useVendor } from '../context/VendorContext';

const VendorLayout = () => {
  const { vendor, isLoading } = useVendor();
  const location = useLocation();

  const navItems = [
    { icon: User, label: 'Profile', path: '/vendor/dashboard/profile' },
    { icon: PlusCircle, label: 'Listings', path: '/vendor/dashboard/listings' },
    { icon: Calendar, label: 'Bookings', path: '/vendor/dashboard/bookings' },
    { icon: DollarSign, label: 'Earnings', path: '/vendor/dashboard/earnings' },
    { icon: BarChart3, label: 'Analytics', path: '/vendor/dashboard/analytics' }
  ];

  if (isLoading || !vendor) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500 text-lg">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <VendorSidebar vendorData={vendor} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-30">
          {/* Top section with logo and user */}
          <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 md:h-[104px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo visible on mobile */}
              <img
                src="https://ik.imagekit.io/jezimf2jod/WhatsApp%20Image%202025-09-11%20at%201.01.04%20PM.jpeg"
                alt="Utsavlokam"
                className="h-9 w-9 rounded-full object-cover md:hidden"
              />
              <div>
                <div className="hidden md:block text-lg text-gray-500">Welcome</div>
                <div className="text-medium md:text-medium font-semibold text-gray-900">
                  {vendor.profile.firstName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 md:p-2">
                <Bell className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gray-900 text-white grid place-items-center text-xs md:text-medium font-medium">
                {vendor.profile.firstName?.[0] || 'V'}
              </div>
            </div>
          </div>

          {/* Mobile Horizontal Tabs - NO SCROLL, compact */}
          <div className="md:hidden">
            <div className="flex justify-around">
              {navItems.map(({ icon: Icon, label, path }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className="relative flex-1"
                  >
                    <div className={`flex flex-col items-center gap-0.5 py-5 transition-colors ${
                      isActive ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] font-medium">{label}</span>
                    </div>
                    {/* Bottom border indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-4 md:p-6">
            <Outlet context={{ vendorData: vendor }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
