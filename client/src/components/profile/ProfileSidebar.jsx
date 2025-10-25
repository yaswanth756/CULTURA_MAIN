// ProfileSidebar.jsx - RESPONSIVE OPTIMIZED
import React from "react";
import { Link } from "react-router-dom";
import {
  User,
  Heart,
  Calendar,
  Settings,
} from "lucide-react";

const ProfileSidebar = ({ activeTab }) => {
  const sidebarItems = [
    { key: "about", label: "About me", icon: User },
    { key: "bookings", label: "My bookings", icon: Calendar },
    { key: "favorites", label: "Saved vendors", icon: Heart },
    { key: "settings", label: "Account settings", icon: Settings },
  ];

  return (
    <nav className="p-3 sm:p-4">
      {sidebarItems.map((item) => (
        <Link
          key={item.key}
          to={`/profile/${item.key}`}
          className={`w-full flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 mb-2 min-h-[48px] rounded-xl text-left transition-all ${
            activeTab === item.key 
            ? "bg-gray-900 text-white shadow-lg" 
            : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            activeTab === item.key ? "bg-white/20" : "bg-gray-100"
          }`}>
            <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="font-medium text-sm sm:text-base">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default ProfileSidebar;
