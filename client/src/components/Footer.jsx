import React from "react";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Logo Section */}
        <div className="col-span-1 flex flex-col">
            <div className="flex items-center gap-1">
                <img
                src="https://ik.imagekit.io/jezimf2jod/WhatsApp%20Image%202025-09-11%20at%201.01.04%20PM.jpeg"
                alt="Cultura logo"
                className="h-12 w-auto rounded-full object-cover"
                />
                <h1 className="text-2xl font-bold text-anzac-500">Utsavlokam</h1>
            </div>
        </div>

        {/* Explore */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Explore</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="/weddings" className="hover:text-anzac-500">Weddings</a></li>
            <li><a href="/birthdays" className="hover:text-anzac-500">Birthdays</a></li>
            <li><a href="/ceremonies" className="hover:text-anzac-500">House Ceremonies</a></li>
            <li><a href="/all-services" className="hover:text-anzac-500">All Services</a></li>
          </ul>
        </div>

        {/* Vendors */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Vendors</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="/vendor/register" className="hover:text-anzac-500">Join as Vendor</a></li>
            <li><a href="/vendor/dashboard" className="hover:text-anzac-500">Dashboard</a></li>
            <li><a href="/promote" className="hover:text-anzac-500">Promote</a></li>
            <li><a href="/pricing" className="hover:text-anzac-500">Pricing</a></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Company</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="/about" className="hover:text-anzac-500">About Us</a></li>
            <li><a href="/career" className="hover:text-anzac-500">Careers</a></li>
            <li><a href="/contact" className="hover:text-anzac-500">Contact</a></li>
          </ul>
        </div>

        {/* Socials */}
        <div className="flex flex-col space-y-3">
          <h3 className="font-semibold text-gray-900">Follow us on</h3>
          <div className="flex space-x-4 text-anzac-600">
            <a href="#"><Twitter size={18} className="hover:text-anzac-500" /></a>
            <a href="#"><Linkedin size={18} className="hover:text-anzac-500" /></a>
            <a href="#"><Facebook size={18} className="hover:text-anzac-500" /></a>
            <a href="#"><Instagram size={18} className="hover:text-anzac-500" /></a>
          </div>
        </div>
      </div>

      {/* Bottom Note */}
      <div className="border-t">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Utsavlokam. All rights reserved.</p>
          <p>Made with ❤️ for celebrations</p>
        </div>
      </div>
    </footer>
  );
}
