import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { Mail, Phone, MapPin, Camera, Edit3, Check, X, Plus, Lock } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

// Neutral shimmer skeleton
const Skeleton = ({ className = "", ...props }) => (
  <div
    className={`relative overflow-hidden rounded bg-gray-200 ${className}`}
    {...props}
  >
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

  useEffect(() => {
    if (user) setUserData(user);
  }, [user]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      offset: 100,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  const startEdit = () => {
    if (!userData) return;
    setFormData({
      firstName: userData.firstName || "",
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
        avatar: userData.avatar,
        location: { city: formData.city, address: formData.address },
      };
      const response = await axios.put("http://localhost:3000/api/auth/profile", updateData, {});
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

  const ProfileSkeleton = () => (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-6 border-b">
              <div className="flex items-start gap-5">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-48" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center border-b last:border-0 py-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-5">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border shadow-sm p-6">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) return <ProfileSkeleton />;

  if (!userData) {
    return (
      <div className="max-w-6xl mx-auto p-6 flex items-center justify-center">
        <div className="text-center" data-aos="fade-up">
          <p className="text-gray-600 mb-2">No profile data available</p>
          <p className="text-sm text-gray-500">Please check your connection and try refreshing</p>
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between" data-aos="fade-up">
        <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Profile</h1>
        {!isEditing ? (
          <button
            onClick={startEdit}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-800 bg-white border rounded-lg hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2" data-aos="fade-up" data-aos-delay="100">
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
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Main */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="lg:col-span-2" data-aos="fade-up" data-aos-delay="150">
          <div className="bg-white rounded-xl border shadow-sm">
            {/* Avatar + name */}
            <div className="p-6 border-b">
              <div className="flex items-start gap-5">
                <div className="relative flex-shrink-0" data-aos="fade-up" data-aos-delay="200">
                  <div className="w-20 h-20 rounded-full bg-gray-100 border flex items-center justify-center overflow-hidden">
                    <img
                      src={userData.avatar && userData.avatar.trim() !== "" ? userData.avatar : DEFAULT_AVATAR}
                      alt={userData.firstName || "User"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = DEFAULT_AVATAR;
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

                <div className="flex-1 min-w-0" data-aos="fade-up" data-aos-delay="250">
                  {!isEditing ? (
                    <>
                      <h3 className="text-[18px] font-semibold text-gray-900 truncate">
                        {userData.firstName || "User Name"}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">
                          Member since {formatDate(userData.createdAt)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="p-6 space-y-2" data-aos="fade-up" data-aos-delay="300">
              <EditableField
                label="Name"
                value={userData.firstName}
                formValue={formData.firstName}
                field="firstName"
                isEditing={isEditing}
                onChange={handleInputChange}
                startEdit={startEdit}
                editable
              />
              <ReadOnlyField label="Email account" value={userData.email} />
              <ReadOnlyField label="Mobile number" value={userData.phone} />
              <EditableField
                label="City"
                value={userData.location?.city}
                formValue={formData.city}
                field="city"
                isEditing={isEditing}
                onChange={handleInputChange}
                startEdit={startEdit}
                editable
              />
              <EditableField
                label="Address"
                value={userData.location?.address}
                formValue={formData.address}
                field="address"
                isEditing={isEditing}
                onChange={handleInputChange}
                startEdit={startEdit}
                editable
                isLast
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-7">
          <div className="bg-white rounded-xl border shadow-sm p-6" data-aos="fade-up" data-aos-delay="200">
            <h4 className="text-base font-medium text-gray-900 mb-3">Account Status</h4>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-800 capitalize">
                  {userData.status || "active"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {userData.role || "user"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm text-gray-900">{formatDate(userData.lastLogin)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6" data-aos="fade-up" data-aos-delay="300">
            <h4 className="text-base font-medium text-gray-900 mb-3">Quick Actions</h4>
            <div className="space-y-4">
              {[
                { text: "Change Password", tone: "text-gray-800" },
                { text: "Privacy Settings", tone: "text-gray-800" },
                { text: "Notification Preferences", tone: "text-gray-800" },
                { text: "Delete Account", tone: "text-rose-600 hover:bg-rose-50" },
              ].map((a, i) => (
                <button
                  key={i}
                  className={`w-full px-3.5 py-2 text-left text-sm rounded-lg hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${a.tone}`}
                  type="button"
                  data-aos="fade-up"
                  data-aos-delay={350 + i * 50}
                >
                  {a.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Local shimmer keyframes (or move to global) */}
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

// Field components
const EditableField = ({
  label,
  value,
  formValue,
  field,
  isEditing,
  onChange,
  startEdit,
  editable = true,
  isLast = false,
}) => {
  const isEmpty = !value || value.trim() === "" || value === "Not specified";
  return (
    <div
      className={`flex justify-between items-center py-4 ${!isLast ? "border-b" : ""}`}
      data-aos="fade-up"
    >
      <div className="text-gray-600">{label}</div>
      {!isEditing ? (
        <div className="flex items-center gap-2">
          <div className={`text-gray-900 ${isEmpty ? "text-gray-500" : ""}`}>
            {!isEmpty ? value : `Add ${label.toLowerCase()}`}
          </div>
          {isEmpty && editable && (
            <button
              onClick={startEdit}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              type="button"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          )}
        </div>
      ) : (
        <input
          type="text"
          value={formValue}
          onChange={(e) => onChange(field, e.target.value)}
          className="px-3 py-2 border rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          placeholder={`Enter your ${label.toLowerCase()}`}
        />
      )}
    </div>
  );
};

const ReadOnlyField = ({ label, value }) => {
  const isEmpty = !value || value.trim() === "" || value === "Not specified";
  return (
    <div className="flex justify-between items-center border-b py-4" data-aos="fade-up">
      <div className="text-gray-600 flex items-center gap-2">
        {label}
        <Lock className="w-3 h-3 text-gray-400" />
      </div>
      <div className={`text-gray-900 ${isEmpty ? "text-gray-500" : ""}`}>
        {!isEmpty ? value : `${label} not provided`}
      </div>
    </div>
  );
};

export default AboutMePanel;
