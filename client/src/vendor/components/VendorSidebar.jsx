// src/vendor/components/VendorSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, PlusCircle, Calendar, DollarSign, BarChart3, LogOut } from 'lucide-react';
import { useVendor } from '../context/VendorContext';

const VendorSidebar = ({ isOpen, onClose}) => {
  const location = useLocation();
  const { logout } = useVendor();

  const items = [
    { icon: User,       label: 'Profile',          path: '/vendor/dashboard/profile' },
    { icon: PlusCircle, label: 'Add New Listing',  path: '/vendor/dashboard/listings' },
    { icon: Calendar,   label: 'Bookings',         path: '/vendor/dashboard/bookings' },
    { icon: DollarSign, label: 'Earnings',         path: '/vendor/dashboard/earnings' },
    { icon: BarChart3,  label: 'Analytics',        path: '/vendor/dashboard/analytics' }
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r transform transition-transform duration-300 md:translate-x-0 md:static ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand */}
      <div className="flex items-center gap-4 px-6 py-7 border-b">
        <img
          src="https://ik.imagekit.io/jezimf2jod/WhatsApp%20Image%202025-09-11%20at%201.01.04%20PM.jpeg"
          alt="Brand"
          className="h-12 w-12 rounded-full object-cover"
        />
        <div>
          <h1 className="text-lg font-bold text-gray-900">Utsavlokam</h1>
          <p className="text-sm text-gray-500">Vendor Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-6 mt-6">
        {items.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200 font-medium ${
                active ? 'bg-anzac-500 text-white shadow-md' : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-0 w-full p-4 border-t">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-800 hover:bg-red-100 hover:text-red-600 transition-colors duration-200 font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default VendorSidebar;
