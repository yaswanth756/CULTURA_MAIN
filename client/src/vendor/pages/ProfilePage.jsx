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
  <div className="bg-gray-50 min-h-screen py-6 px-4">
    <div className="max-w-3xl mx-auto animate-pulse">
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gray-200"></div>
          <div className="flex-1 w-full space-y-3 text-center sm:text-left">
            <div className="h-7 w-3/4 mx-auto sm:mx-0 rounded bg-gray-200"></div>
            <div className="h-5 w-1/4 mx-auto sm:mx-0 rounded bg-gray-200"></div>
            <div className="h-4 w-1/2 mx-auto sm:mx-0 rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="h-6 w-1/3 rounded bg-gray-200 mb-4"></div>
          <div className="space-y-4">
            <div className="h-5 w-full rounded bg-gray-200"></div>
            <div className="h-5 w-full rounded bg-gray-200"></div>
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

  // Fix decimal rating - round to 1 decimal place
  const displayRating = vendorInfo.rating ? Number(vendorInfo.rating).toFixed(1) : "0.0";

  return (
    <div className="bg-gray-50  sm:px-6 lg:px-8 pb-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-8">
        {/* --- Header --- */}
        <header className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <img
            alt={profile.firstName || "Vendor"}
            src="https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-859.jpg"
            className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover shadow-md ring-4 ring-gray-100"
          />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {profile.firstName || "Vendor"}
            </h1>
            <p className="text-base sm:text-lg font-medium text-anzac-600 mt-1">
              {profile.businessName}
            </p>
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-x-4 text-xs sm:text-sm text-gray-600">
              <span className="flex items-center justify-center sm:justify-start gap-1.5">
                <MapPin className="flex-shrink-0" size={14} />
                <span className="truncate">{location.city}, {location.address}</span>
              </span>
              {vendorInfo.reviewCount > 0 && (
                <span className="flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                  <Star className="flex-shrink-0 text-amber-500" size={14} fill="currentColor" />
                  <span>{displayRating} ({vendorInfo.reviewCount} reviews)</span>
                </span>
              )}
            </div>
          </div>
        </header>

        {/* --- Details --- */}
        <section className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
          <h2 className="font-semibold text-lg sm:text-xl text-gray-900 mb-4 sm:mb-6">
            Details
          </h2>
          <div className="space-y-6 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6 sm:space-y-0">
            {/* Contact */}
            <div>
              <h3 className="font-medium text-sm text-gray-500 mb-3">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm sm:text-base text-gray-800">
                  <Mail size={18} className="text-gray-400 flex-shrink-0" />
                  <span className="break-all">{email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm sm:text-base text-gray-800">
                  <Phone size={18} className="text-gray-400 flex-shrink-0" />
                  <span>{phone}</span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-medium text-sm text-gray-500 mb-3">Services</h3>
              <div className="flex items-start gap-3 text-sm sm:text-base text-gray-800">
                <Briefcase size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <span>{(vendorInfo.services || []).join(", ") || "No services listed"}</span>
              </div>
            </div>
          </div>
        </section>

        {/* --- Account Status --- */}
        <section className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
          <h2 className="font-semibold text-lg sm:text-xl text-gray-900 mb-4 sm:mb-6">
            Account Status
          </h2>
          <div className="space-y-6 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-8 sm:space-y-0">
            {/* Verification */}
            <div>
              <h3 className="font-medium text-sm text-gray-500 mb-3">Verification</h3>
              {isVerified ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 text-sm sm:text-base text-green-700 font-semibold">
                    <ShieldCheck size={18} />
                    <span>Verified</span>
                  </span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-2 text-sm sm:text-base text-amber-700 font-semibold">
                      <Hourglass size={18} />
                      <span>Pending Review</span>
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">
                    We'll review your profile within 24 hours.
                  </p>
                </div>
              )}
            </div>

            {/* Onboarding */}
            <div>
              <h3 className="font-medium text-sm text-gray-500 mb-3">Onboarding</h3>
              <div className="flex items-center gap-2">
                {onboardingCompleted ? (
                  <span className="inline-flex items-center gap-2 text-sm sm:text-base text-green-700 font-semibold">
                    <CheckCircle2 size={18} />
                    <span>Completed</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm sm:text-base text-amber-700 font-semibold">
                    <Loader2 size={18} className="animate-spin" />
                    <span>In Progress</span>
                  </span>
                )}
              </div>
            </div>

            {/* Member Since */}
            <div>
              <h3 className="font-medium text-sm text-gray-500 mb-3">Member Since</h3>
              <div className="flex items-center gap-3 text-sm sm:text-base text-gray-800">
                <CalendarDays size={18} className="text-gray-400 flex-shrink-0" />
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
