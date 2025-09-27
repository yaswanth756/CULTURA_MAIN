import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { buildApiUrl } from "../../utils/api";
import { Mail, Phone, MapPin, Camera, Edit3, Check, X, Plus, Coins } from "lucide-react"; // ✅ Added Coins icon
import AOS from "aos";
import "aos/dist/aos.css";

/* Neutral shimmer skeleton */
const Skeleton = ({ className = "", ...props }) => (
  <div className={`relative overflow-hidden rounded bg-gray-200 ${className}`} {...props}>
    <span className="absolute inset-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_1.8s_ease-in-out_infinite]" />
  </div>
);

const AboutMePanel = () => {
  const { user, isLoading, setIsLoading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const DEFAULT_AVATAR =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQF02Jj8T2t7PdkytAw42HDuuSz7yXguKn8Lg&s";

  // 🪙 NEW: Fetch user profile with coins data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(buildApiUrl("/api/user/profile"));
        if (response.data.success) {
          setUserData(response.data.data);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        // Fallback to auth context user if API fails
        if (user) setUserData(user);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    AOS.init({ duration: 800, offset: 100, easing: "ease-in-out", once: true });
  }, []);

  const startEdit = () => {
    if (!userData) return;
    setFormData({
      firstName: userData.profile?.firstName || userData.firstName || "",
      city: userData.location?.city || "",
      address: userData.location?.address || "",
    });
    setIsEditing(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
  };

  const saveChanges = async () => {
    if (!userData) return;
    try {
      setIsLoading(true);
      const updateData = {
        firstName: formData.firstName,
        email: userData.email,
        phone: userData.phone,
        avatar: userData.profile?.avatar || userData.avatar,
        location: { city: formData.city, address: formData.address },
      };
      const response = await axios.put(buildApiUrl("/api/auth/profile"), updateData, {});
      if (response.data.success) {
        setUserData(response.data.data);
        setIsEditing(false);
      }
    } catch (error) {
      let msg = "Failed to update profile";
      if (error.response?.data?.message) msg = error.response.data.message;
      else if (error.response?.data?.errors) msg = error.response.data.errors.join(", ");
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setFormData({});
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 🪙 NEW: Format coins display
  const formatCoins = (amount) => {
    if (!amount || amount === 0) return "0";
    return amount.toLocaleString();
  };

  const ProfileSkeleton = () => (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Header + Personal info (same shell as live) */}
      <section className="bg-white rounded-2xl border shadow-sm">
        {/* Header card */}
        <div className="p-6 border-b">
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-44" />
            </div>
          </div>
        </div>

        {/* Personal information grid (match: gap-x-8 gap-y-7 sm:grid-cols-2) */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2 min-h-[56px]">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-full max-w-[224px]" />
            </div>
          ))}
        </div>
      </section>

      {/* Address card */}
      <section className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="mb-4">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2 min-h-[56px]">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-full max-w-[224px]" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  if (isLoading) return <ProfileSkeleton />;

  if (!userData) {
    return (
      <div className="max-w-3xl mx-auto p-6 flex items-center justify-center">
        <div className="text-center" data-aos="fade-up">
          <p className="text-gray-600 mb-2">No profile data available</p>
          <p className="text-sm text-gray-500">Please check the connection and try refreshing</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const StatusBadge = () => (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-800">
      Active
    </span>
  );

  // Get user display data (handle both old and new user object structures)
  const displayName = userData.profile?.firstName || userData.firstName || "User Name";
  const displayEmail = userData.email;
  const displayPhone = userData.phone;
  const displayAvatar = userData.profile?.avatar || userData.avatar;
  const displayCity = userData.location?.city;
  const displayAddress = userData.location?.address;
  const displayCoins = userData.coins?.totalEarned || 0;

  return (
    <div className="min-h-screen roun py-2">
      <div className="mx-auto max-w-3xl bg-white rounded-2xl px-4 space-y-6">
        {/* Page title + actions */}
        <div className="flex items-center justify-between pt-3" data-aos="fade-up">
          <h1 className="text-2xl font-semibold text-slate-900">My Profile</h1>
          {!isEditing ? (
            <button
              onClick={startEdit}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-800 bg-white border rounded-lg hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={cancelEdit}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={saveChanges}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60"
                disabled={isLoading}
              >
                <Check className="w-4 h-4" />
                Save
              </button>
            </div>
          )}
        </div>

        {/* Header card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-aos="fade-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="h-16 w-16 rounded-full bg-slate-100 ring-1 ring-slate-200 overflow-hidden flex items-center justify-center">
                  <img
                    src={displayAvatar && displayAvatar.trim() !== "" ? displayAvatar : DEFAULT_AVATAR}
                    alt={displayName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_AVATAR;
                    }}
                  />
                </div>
                {isEditing && (
                  <button
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    type="button"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Name + meta */}
              <div className="space-y-0.5">
                {!isEditing ? (
                  <p className="text-xl font-semibold text-slate-900">{displayName}</p>
                ) : (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="text-xl font-semibold text-slate-900 border rounded-lg px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    placeholder="Enter full name"
                  />
                )}
                <p className="text-sm text-slate-500">
                  Customer • Member since {formatDate(userData.createdAt)}
                </p>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <StatusBadge />
                  <span className="text-gray-400">•</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {displayCity === "Not specified" ? "—" : (displayCity ?? "—")}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Personal information */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-aos="fade-up">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Personal information</h2>
            {!isEditing ? null : <span className="text-xs text-slate-500">Editing mode</span>}
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
            <FieldLike label="Name">
              <EditableInline
                value={displayName}
                formValue={formData.firstName}
                isEditing={isEditing}
                onChange={(v) => handleInputChange("firstName", v)}
                placeholder="Enter full name"
              />
            </FieldLike>

            <FieldLike label="Email account">
              <ReadOnlyInline value={displayEmail} icon={<Mail className="w-3.5 h-3.5 text-gray-400" />} />
            </FieldLike>

            <FieldLike label="Mobile number">
              <ReadOnlyInline value={displayPhone} icon={<Phone className="w-3.5 h-3.5 text-gray-400" />} />
            </FieldLike>

            <FieldLike label="Status">
              <span className="text-slate-900">Active</span>
            </FieldLike>

            {/* 🪙 NEW: Coins earned instead of last login */}
            <FieldLike label="Coins earned">
  <div className="inline-flex items-center gap-2 text-slate-900 group">
    {/* 🪙 Simple Hover Animation */}
    <Coins className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform duration-200 ease-out" />
    
    {/* 🎯 Number with subtle glow */}
    <span className="font-semibold text-amber-600 group-hover:text-amber-500 transition-colors duration-200">
      {formatCoins(displayCoins)}
    </span>
    
    {/* 🏷️ Label */}
    <span className="text-xs text-slate-500">
      Utsav Coins
    </span>
  </div>
            </FieldLike>


            <FieldLike label="Member since">
              <span className="text-slate-900">{formatDate(userData.createdAt)}</span>
            </FieldLike>
          </dl>
        </section>

        {/* Address */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-aos="fade-up">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Address</h2>
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <FieldLike label="City">
              <EditableInline
                value={displayCity}
                formValue={formData.city}
                isEditing={isEditing}
                onChange={(v) => handleInputChange("city", v)}
                placeholder="Enter city"
                showAddWhenEmpty
                onAdd={startEdit}
              />
            </FieldLike>

            <FieldLike label="Address">
              <EditableInline
                value={displayAddress}
                formValue={formData.address}
                isEditing={isEditing}
                onChange={(v) => handleInputChange("address", v)}
                placeholder="Enter address"
                showAddWhenEmpty
                onAdd={startEdit}
              />
            </FieldLike>
          </dl>
        </section>
      </div>

      {/* Local shimmer keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-60%);
          }
          100% {
            transform: translateX(120%);
          }
        }
      `}</style>
    </div>
  );
};

/* dt/dd layout shell */
const FieldLike = ({ label, children }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
    <dd className="mt-1">{children}</dd>
  </div>
);

/* UPDATED: supports "+ Add" when empty */
const EditableInline = ({
  value,
  formValue,
  isEditing,
  onChange,
  placeholder,
  showAddWhenEmpty = false,
  onAdd,
}) => {
  const isEmpty = !value || value.trim() === "" || value === "Not specified";

  if (!isEditing) {
    if (isEmpty && showAddWhenEmpty) {
      return (
        <div className="flex items-center justify-between">
          <span className="text-gray-500">—</span>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Add value"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>
      );
    }
    return <span className={`text-slate-900 ${isEmpty ? "text-gray-500" : ""}`}>{!isEmpty ? value : "—"}</span>;
  }

  return (
    <input
      type="text"
      value={formValue ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      placeholder={placeholder}
    />
  );
};

const ReadOnlyInline = ({ value, icon }) => {
  const isEmpty = !value || value.trim() === "" || value === "Not specified";
  return (
    <span className={`inline-flex items-center gap-2 ${isEmpty ? "text-gray-500" : "text-slate-900"}`}>
      {icon}
      {!isEmpty ? value : "—"}
    </span>
  );
};

export default AboutMePanel;
