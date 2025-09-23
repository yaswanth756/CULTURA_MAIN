// vendor/pages/VendorDashboard.jsx
import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  User, 
  PlusCircle, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Menu, 
  X, 
  Lock,
  LogOut,
  Bell,
  Settings
} from 'lucide-react'
import { useVendor } from '../context/VendorContext'

const VendorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { vendor, logout } = useVendor()

  // Dummy vendor data if not loaded
  const vendorData = vendor || {
    profile: { firstName: 'John Doe', businessName: 'John Photography' },
    vendorInfo: { verified: false }
  }

  const menuItems = [
    {
      icon: User,
      label: 'Profile',
      path: '/vendor/dashboard/profile',
      unlocked: true
    },
    {
      icon: PlusCircle,
      label: 'Add New Listing',
      path: '/vendor/dashboard/listings',
      unlocked: vendorData.vendorInfo.verified
    },
    {
      icon: Calendar,
      label: 'Bookings',
      path: '/vendor/dashboard/bookings',
      unlocked: vendorData.vendorInfo.verified
    },
    {
      icon: DollarSign,
      label: 'Earnings',
      path: '/vendor/dashboard/earnings',
      unlocked: vendorData.vendorInfo.verified
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      path: '/vendor/dashboard/analytics',
      unlocked: vendorData.vendorInfo.verified
    }
  ]

  const handleMenuClick = (item) => {
    if (item.unlocked) {
      navigate(item.path)
      setSidebarOpen(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-gray-200">
            <img
              src="https://ik.imagekit.io/jezimf2jod/WhatsApp%20Image%202025-09-11%20at%201.01.04%20PM.jpeg"
              alt="Utsavlokam"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Utsavlokam</h1>
              <p className="text-xs text-gray-500">Vendor Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <div key={item.path} className="relative">
                  <button
                    onClick={() => handleMenuClick(item)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      isActive
                        ? 'bg-anzac-50 text-anzac-700 border border-anzac-200'
                        : item.unlocked
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!item.unlocked}
                  >
                    <div className="relative">
                      <Icon className="w-5 h-5" />
                      {!item.unlocked && (
                        <Lock className="w-3 h-3 absolute -top-1 -right-1 text-gray-500" />
                      )}
                    </div>
                    <span className="font-medium">{item.label}</span>
                    {!item.unlocked && (
                      <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        Locked
                      </span>
                    )}
                  </button>
                </div>
              )
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white shadow-sm border-b border-gray-200 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Welcome, {vendorData.profile.firstName}! 👋
                </h2>
                <p className="text-sm text-gray-600">{vendorData.profile.businessName}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Verification status */}
              {vendorData.vendorInfo.verified ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 text-sm font-medium rounded-full border border-amber-200">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Under Review
                </span>
              )}

              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile dropdown placeholder */}
              <div className="w-8 h-8 bg-gradient-to-br from-anzac-400 to-anzac-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {vendorData.profile.firstName?.charAt(0) || 'V'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default VendorDashboard
