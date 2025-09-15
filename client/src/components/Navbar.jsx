import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navLinks = [
  { path: "/browse", label: "Browse Events", type: "route" },
  { path: "/#work", label: "Work Showcase", type: "hash" },
  { path: "/#about", label: "About Us", type: "hash" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white">
      <div className="px-10 py-6 flex justify-between items-center">
        {/* Logo + Brand */}
        <div className="flex items-center gap-16">
          <div className="flex items-center gap-3">
            <img
              src="https://ik.imagekit.io/jezimf2jod/WhatsApp%20Image%202025-09-11%20at%201.01.04%20PM.jpeg"
              alt="Cultura logo"
              className="h-12 w-auto rounded-full object-cover"
            />
            <h1 className="text-2xl font-bold text-anzac-500">Utsavlokam</h1>
          </div>

          {/* Desktop Nav */}
          <ul className="hidden md:flex gap-8">
            {navLinks.map(({ path, label, type }) => (
              <li key={path} className="relative group">
                {type === "route" ? (
                  <Link
                    to={path}
                    className="pb-1 text-black hover:text-anzac-500 transition-colors duration-300 font-medium"
                  >
                    {label}
                  </Link>
                ) : (
                  <a
                    href={path}
                    className="pb-1 text-black hover:text-anzac-500 transition-colors duration-300 font-medium"
                  >
                    {label}
                  </a>
                )}
                {/* underline animation only on hover */}
                
              </li>
            ))}
          </ul>
        </div>

        {/* Buttons */}
        <div className="hidden md:flex items-center gap-5">
          <button className="h-12 px-4 rounded-full bg-gray-50 text-gray-800 transition-all duration-300 hover:bg-gray-100">
            Become Host
          </button>

          <button className="relative h-12 px-5 rounded-full text-anzac-500 overflow-hidden group border border-anzac-500">
            <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
              Sign Up
            </span>
            {/* bg fill animation */}
            <span className="absolute inset-0 bg-anzac-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out rounded-full"></span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-gray-50 border-t px-6 pb-4">
          <ul className="flex flex-col gap-4 mt-4">
            {navLinks.map(({ path, label, type }) => (
              <li key={path}>
                {type === "route" ? (
                  <Link
                    to={path}
                    className="block text-gray-600 hover:text-gray-900 transition-colors duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    {label}
                  </Link>
                ) : (
                  <a
                    href={path}
                    className="block text-gray-600 hover:text-gray-900 transition-colors duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    {label}
                  </a>
                )}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 mt-6">
            <button className="bg-anzac-600 text-white px-4 py-2 rounded-lg hover:bg-anzac-700 transition">
              Become Host
            </button>
            <button className="border border-anzac-500 text-anzac-500 px-4 py-2 rounded-lg hover:bg-anzac-500 hover:text-white transition">
              Sign Up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
