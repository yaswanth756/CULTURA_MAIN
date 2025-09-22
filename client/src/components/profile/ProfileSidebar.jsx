import React from "react";
import { Link } from "react-router-dom";
import {
  User,
  Heart,
  Calendar,
  Settings,
  MessageSquare
} from "lucide-react";

const ProfileSidebar = ({ activeTab }) => {
  const sidebarItems = [
    { key: "about", label: "About me", icon: User },
    { key: "bookings", label: "My bookings", icon: Calendar },
    { key: "favorites", label: "Saved vendors", icon: Heart },
    { key: "settings", label: "Account settings", icon: Settings },
  ];

  return (
    <nav className="p-4">
      {sidebarItems.map((item) => (
        <Link
          key={item.key}
          to={`/profile/${item.key}`}
          className={`w-full flex items-center gap-4 px-4 py-3 mb-2 rounded-xl text-left transition-all ${
            activeTab === item.key 
            ? "bg-gray-900 text-white shadow-lg" 
            : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            activeTab === item.key ? "bg-white/20" : "bg-gray-100"
          }`}>
            <item.icon className="w-5 h-5" />
          </div>
          <span className="font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default ProfileSidebar;
