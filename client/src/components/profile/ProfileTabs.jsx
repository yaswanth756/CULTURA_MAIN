// ProfileTabs.jsx - HORIZONTAL TABS FOR MOBILE
import React from "react";
import { Link } from "react-router-dom";
import {
  User,
  Heart,
  Calendar,
  Settings,
} from "lucide-react";

const ProfileTabs = ({ activeTab }) => {
  const tabItems = [
    { key: "about", label: "About", icon: User },
    { key: "bookings", label: "Bookings", icon: Calendar },
    { key: "favorites", label: "Saved", icon: Heart },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex overflow-x-auto scrollbar-hide">
      {tabItems.map((item) => (
        <Link
          key={item.key}
          to={`/profile/${item.key}`}
          className={`flex-1 min-w-[80px] flex flex-col items-center gap-1.5 px-3 py-3 min-h-[56px] transition-colors ${
            activeTab === item.key 
            ? "text-gray-900 border-b-2 border-gray-900" 
            : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
          }`}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
        </Link>
      ))}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ProfileTabs;
