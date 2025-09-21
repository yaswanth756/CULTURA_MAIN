import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import ProfileSidebar from "../components/profile/ProfileSidebar";
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

  const handleLogout = () => {
    alert("Logging out...");
    // TODO: Add logout logic when backend is ready
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        </div>
        
        <ProfileSidebar activeTab={currentTab} />
        
        <div className="p-4 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ProfilePage;
