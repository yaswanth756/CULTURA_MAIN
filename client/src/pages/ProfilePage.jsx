// ProfilePage.jsx - WITHOUT SEPARATE SIGNOUT BUTTON
import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import ProfileTabs from "../components/profile/ProfileTabs";
import AOS from "aos";
import "aos/dist/aos.css";

const ProfilePage = () => {
  const location = useLocation();
  const currentTab = location.pathname.split('/').pop() || 'about';
  
  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  // Redirect to about tab if on base /profile path
  if (location.pathname === '/profile') {
    return <Navigate to="/profile/about" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Horizontal Tabs - Visible only on mobile */}
      <div className="lg:hidden sticky top-0 z-20 bg-white border-b shadow-sm">
        <ProfileTabs activeTab={currentTab} />
      </div>

      <div className="flex">
        {/* Desktop Sidebar - Hidden on mobile */}
        <aside className="hidden lg:flex lg:flex-col w-80 bg-white shadow-sm min-h-screen">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <ProfileSidebar activeTab={currentTab} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
