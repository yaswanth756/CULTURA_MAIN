import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, Home, LogOut } from "lucide-react";
import { useEventContext } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { path: "/browse", label: "Browse Events", type: "route" },
  { path: "#work", label: "Work Showcase", type: "hash" },
  { path: "#about", label: "About Us", type: "hash" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDrop, setIsDrop] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const { setModelOpen } = useEventContext();
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Filter navLinks based on current route
  const filteredNavLinks = navLinks.filter(link => {
    if (link.type === "hash") {
      return location.pathname === "/";
    }
    return true;
  });

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDrop(false);
      }
    };

    if (isDrop) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDrop]);

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsDrop(false);
  };

  return (
    <nav className="sticky top-0 z-30 bg-white">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-5 lg:py-6 flex justify-between items-center">
        {/* Logo + Brand */}
        <Link to="/">
          <div className="flex items-center gap-8 sm:gap-12 lg:gap-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="https://ik.imagekit.io/jezimf2jod/WhatsApp%20Image%202025-09-11%20at%201.01.04%20PM.jpeg"
                alt="Cultura logo"
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
              />
              <h1 className="text-xl sm:text-2xl font-bold text-anzac-500">Utsavlokam</h1>
            </div>
            {/* Desktop Nav */}
            <ul className="hidden md:flex gap-6 lg:gap-8">
              {filteredNavLinks.map(({ path, label, type }) => (
                <li key={path} className="relative group">
                  {type === "route" ? (
                    <Link
                      to={path}
                      className="pb-1 text-sm lg:text-base text-black hover:text-anzac-500 transition-colors duration-300 font-medium"
                    >
                      {label}
                    </Link>
                  ) : (
                    <a
                      href={path}
                      className="pb-1 text-sm lg:text-base text-black hover:text-anzac-500 transition-colors duration-300 font-medium"
                    >
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Link>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3 lg:gap-5">
          <Link to='/vendor/login'>
            <button className="h-10 sm:h-11 lg:h-12 px-3 sm:px-4 rounded-full text-sm lg:text-base text-gray-800 transition-all duration-300 hover:bg-gray-100 whitespace-nowrap">
              Become Host
            </button>
          </Link>
        
          {isLoading ? (
            <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full bg-gray-200 animate-pulse"></div>
          ) : user && user.firstName ? (
            <div className="relative" ref={dropdownRef}>
              <button
                className="bg-gray-800 rounded-full text-white text-base sm:text-lg font-medium w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 flex items-center justify-center shadow-md hover:bg-gray-700 hover:shadow-lg transition-all duration-200"
                onClick={() => setIsDrop(!isDrop)}
              >
                {user.firstName.charAt(0).toUpperCase()}
              </button>
              
              {/* Dropdown */}
              <div
                className={`absolute right-0 mt-3 w-64 origin-top-right bg-white border border-gray-100 rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden transition-all duration-200 ease-out ${
                  isDrop
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 translate-y-2 pointer-events-none"
                }`}
              >
                {/* User Info Section */}
                <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-medium">
                      {user.firstName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.firstName} {user.lastName || ""}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email || user.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 min-h-[48px] text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150 group"
                    onClick={() => setIsDrop(false)}
                  >
                    <User className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    <span className="font-medium">My Profile</span>
                  </Link>
                  
                  <Link
                    to="/vendor/login"
                    className="flex items-center gap-3 px-4 py-3 min-h-[48px] text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150 group"
                    onClick={() => setIsDrop(false)}
                  >
                    <Home className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    <span className="font-medium">Become Host</span>
                  </Link>
                </div>

                {/* Logout Section */}
                <div className="border-t border-gray-100">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 min-h-[48px] text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 group"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              className="relative h-10 sm:h-11 lg:h-12 px-4 sm:px-5 rounded-full text-sm lg:text-base text-anzac-500 overflow-hidden group border border-anzac-500"
              onClick={() => setModelOpen(true)}
            >
              <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                Sign Up
              </span>
              <span className="absolute inset-0 bg-anzac-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out rounded-full"></span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-gray-50 border-t px-4 sm:px-6 pb-4">
          <ul className="flex flex-col gap-3 sm:gap-4 mt-4">
            {filteredNavLinks.map(({ path, label, type }) => (
              <li key={path}>
                {type === "route" ? (
                  <Link
                    to={path}
                    className="block text-base text-gray-600 hover:text-gray-900 transition-colors duration-300 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {label}
                  </Link>
                ) : (
                  <a
                    href={path}
                    className="block text-base text-gray-600 hover:text-gray-900 transition-colors duration-300 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {label}
                  </a>
                )}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 mt-6">
            <Link to='/vendor/login'>
              <button 
                className="w-full bg-anzac-600 text-white px-4 py-3 min-h-[48px] rounded-lg hover:bg-anzac-700 transition text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Become Host
              </button>
            </Link>
            {isLoading ? (
              <div className="w-full h-12 rounded-lg bg-gray-200 animate-pulse"></div>
            ) : user && user.firstName ? (
              <>
                <Link to="/profile">
                  <button 
                    className="w-full border border-gray-300 text-gray-700 px-4 py-3 min-h-[48px] rounded-lg hover:bg-gray-100 transition text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    My Profile
                  </button>
                </Link>
                <button
                  className="w-full border border-red-300 text-red-600 px-4 py-3 min-h-[48px] rounded-lg hover:bg-red-50 transition text-base font-medium"
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                className="w-full border border-anzac-500 text-anzac-500 px-4 py-3 min-h-[48px] rounded-lg hover:bg-anzac-500 hover:text-white transition text-base font-medium"
                onClick={() => setModelOpen(true)}
              >
                Sign Up
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
