import React, { useEffect, useState } from "react";
import { useVendor } from "../context/VendorContext";
import {
  MapPin,
  Star,
  Mail,
  Phone,
  Briefcase,
  CalendarDays,
  ShieldCheck,
  Hourglass,
  CheckCircle2,
  Loader2
} from "lucide-react";

// --- Skeleton ---
const ProfileSkeleton = () => (
  <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
    <div className="max-w-3xl mx-auto p-6 animate-pulse">
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-gray-200"></div>
          <div className="flex-1 w-full space-y-3 text-center sm:text-left">
            <div className="h-8 w-3/4 mx-auto sm:mx-0 rounded bg-gray-200"></div>
            <div className="h-5 w-1/4 mx-auto sm:mx-0 rounded bg-gray-200"></div>
            <div className="h-4 w-1/2 mx-auto sm:mx-0 rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="h-6 w-1/3 rounded bg-gray-200 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-5 w-full rounded bg-gray-200"></div>
              <div className="h-5 w-full rounded bg-gray-200"></div>
            </div>
            <div className="space-y-4">
              <div className="h-5 w-full rounded bg-gray-200"></div>
              <div className="h-5 w-full rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Main ProfilePage ---
const ProfilePage = () => {
  const { vendor, isLoading } = useVendor();
  const [showSkeleton, setShowSkeleton] = useState(true);

  // Determine if vendor data is actually ready
  const hasData =
    vendor &&
    vendor.profile &&
    vendor.vendorInfo &&
    Object.keys(vendor.profile).length > 0;

  // Hide skeleton when data is ready
  useEffect(() => {
    if (!isLoading && hasData) {
      // Optional delay to prevent flicker
      const timeout = setTimeout(() => setShowSkeleton(false), 50);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, hasData]);

  if (isLoading || showSkeleton || !hasData) {
    return <ProfileSkeleton />;
  }

  // Safe destructure
  const { profile, location = {}, vendorInfo, email, phone, createdAt } = vendor;

  const isVerified = vendorInfo.verified;
  const onboardingCompleted = vendorInfo.onboardingCompleted;

  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : "N/A";

  return (
    <div className="bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-6 sm:p-8">
        {/* --- Header --- */}
        <header className="flex flex-col sm:flex-row items-center gap-6">
          <img
            alt={profile.firstName || "Vendor"}
            src="https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-859.jpg"
            className="h-24 w-24 rounded-full object-cover shadow-md"
          />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900">{profile.firstName || "Vendor"}</h1>
            <p className="text-lg font-medium text-anzac-600 mt-0.5">{profile.businessName}</p>
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <span className="flex items-center">
                <MapPin className="mr-1.5" size={16} />
                {location.city}, {location.address}
              </span>
              <span className="flex items-center">
                <Star className="mr-1.5" size={16} />
                {vendorInfo.reviewCount > 0
                  ? `${vendorInfo.rating} (${vendorInfo.reviewCount} reviews)`
                  : "No reviews yet"}
              </span>
            </div>
          </div>
        </header>

        {/* --- Details --- */}
        <section className="mt-8 pt-8 border-t border-gray-200">
          <h2 className="font-semibold text-xl text-gray-900 mb-6">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <h3 className="font-medium text-gray-500 mb-3">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-800 font-medium">
                  <Mail size={20} className="text-gray-400" />
                  <span>{email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-800 font-medium">
                  <Phone size={20} className="text-gray-400" />
                  <span>{phone}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-500 mb-3">Services</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-800 font-medium">
                  <Briefcase size={20} className="text-gray-400" />
                  <span>{(vendorInfo.services || []).join(", ") || "No services listed"}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Account Status --- */}
        <section className="mt-8 pt-8 border-t border-gray-200">
          <h2 className="font-semibold text-xl text-gray-900 mb-6">Account Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            <div>
              <h3 className="font-medium text-gray-500 mb-3">Verification</h3>
              {isVerified ? (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 text-green-700 font-semibold">
                    <ShieldCheck size={20} />
                    <span>Verified</span>
                  </span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 text-amber-700 font-semibold">
                      <Hourglass size={20} />
                      <span>Pending Review</span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 ml-1">
                    We'll review your profile within 24 hours.
                  </p>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-500 mb-3">Onboarding</h3>
              <div className="flex items-center gap-3">
                {vendorInfo.onboardingCompleted ? (
                  <span className="inline-flex items-center gap-2 text-green-700 font-semibold">
                    <CheckCircle2 size={20} />
                    <span>Completed</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-amber-700 font-semibold">
                    <Loader2 size={20} className="animate-spin" />
                    <span>In Progress</span>
                  </span>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-500 mb-3">Member Since</h3>
              <div className="flex items-center gap-3 text-gray-800 font-medium">
                <CalendarDays size={20} className="text-gray-400" />
                <span>{memberSince}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
