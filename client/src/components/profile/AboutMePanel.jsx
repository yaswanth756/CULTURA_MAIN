import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
  Mail,
  Phone,
  MapPin,
  Camera,
  Edit3,
  Check,
  X,
  Plus,
  Lock
} from "lucide-react";

// Custom Skeleton Component
const Skeleton = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
      style={{
        animation: 'shimmer 2s linear infinite'
      }}
      {...props}
    />
  );
};

const AboutMePanel = () => {
  const { user, isLoading, setIsLoading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // Default avatar
  const DEFAULT_AVATAR =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQF02Jj8T2t7PdkytAw42HDuuSz7yXguKn8Lg&s";

  useEffect(() => {
    if (user) {
      setUserData(user);
      console.log("User data in AboutMePanel:", user);
    }
  }, [user]);

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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveChanges = async () => {
    if (!userData) return;

    try {
      setIsLoading(true);

      const updateData = {
        firstName: formData.firstName,
        email: userData.email, // Keep original email
        phone: userData.phone, // Keep original phone
        avatar: userData.avatar, // Keep original avatar
        location: {
          city: formData.city,
          address: formData.address,
        },
      };

      const response = await axios.put(
        "http://localhost:3000/api/auth/profile",
        updateData,
        {
        }
      );

      if (response.data.success) {
        setUserData(response.data.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);

      let errorMessage = "Failed to update profile";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(", ");
      }
      alert(errorMessage);
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

  const isFieldEmpty = (value) => {
    return !value || value.trim() === "" || value === "Not specified";
  };

  // Skeleton Loading Component
  const ProfileSkeleton = () => (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card Skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {/* Avatar Section Skeleton */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start gap-6">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details Skeleton */}
            <div className="p-6 space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center border-b py-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-5">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Loading state with skeleton
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // No data state
  if (!userData) {
    return (
      <div className="max-w-6xl mx-auto p-6 flex items-center justify-center">
        <div className="text-center transform transition-all duration-300 scale-100 hover:scale-105">
          <p className="text-gray-600 mb-4">No profile data available</p>
          <p className="text-sm text-gray-500">
            Please check your connection and try refreshing
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform transition-all duration-200 hover:scale-105"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between transform transition-all duration-300 ease-in-out">
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        {!isEditing ? (
          <button
            onClick={startEdit}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transform transition-all duration-200 hover:scale-105"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-3 transform transition-all duration-300 ease-in-out">
            <button
              onClick={cancelEdit}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transform transition-all duration-200 hover:scale-105"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={saveChanges}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transform transition-all duration-200 hover:scale-105"
            >
              <Check className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 transform transition-all duration-500 ease-in-out">
        {/* Profile card */}
        <div className="lg:col-span-2 transform transition-all duration-300 ease-in-out">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Avatar */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start gap-6">
                <div className="relative flex-shrink-0 transform transition-all duration-300 ease-in-out hover:scale-105">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    <img
                      src={
                        userData.avatar && userData.avatar.trim() !== ""
                          ? userData.avatar
                          : DEFAULT_AVATAR
                      }
                      alt={userData.firstName || "User"}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      onError={(e) => {
                        e.target.src = DEFAULT_AVATAR;
                      }}
                    />
                  </div>
                  {isEditing && (
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transform transition-all duration-200 hover:scale-110">
                      <Camera className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Name + info */}
                <div className="flex-1 min-w-0">
                  {!isEditing ? (
                    <div className="transform transition-all duration-300 ease-in-out">
                      <h3 className="text-xl font-semibold text-gray-900 truncate">
                        {userData.firstName || "User Name"}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">
                          Member since {formatDate(userData.createdAt)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 transform transition-all duration-300 ease-in-out">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="p-6 space-y-6">
              {/* Name */}
              <EditableField
                label="Name"
                value={userData.firstName}
                formValue={formData.firstName}
                field="firstName"
                isEditing={isEditing}
                onChange={handleInputChange}
                startEdit={startEdit}
                editable={true}
              />
              
              {/* Email - Non-editable */}
              <ReadOnlyField
                label="Email account"
                value={userData.email}
              />
              
              {/* Phone - Non-editable */}
              <ReadOnlyField
                label="Mobile number"
                value={userData.phone}
              />
              
              {/* City */}
              <EditableField
                label="City"
                value={userData.location?.city}
                formValue={formData.city}
                field="city"
                isEditing={isEditing}
                onChange={handleInputChange}
                startEdit={startEdit}
                editable={true}
              />
              
              {/* Address - No border */}
              <EditableField
                label="Address"
                value={userData.location?.address}
                formValue={formData.address}
                field="address"
                isEditing={isEditing}
                onChange={handleInputChange}
                startEdit={startEdit}
                editable={true}
                isLast={true}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5 transform transition-all duration-300 ease-in-out">
          {/* Account Status */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Account Status
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
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
                <span className="text-sm text-gray-900">
                  {formatDate(userData.lastLogin)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h4>
            <div className="space-y-3">
              {[
                { text: "Change Password", color: "text-gray-700", bgHover: "hover:bg-gray-50" },
                { text: "Privacy Settings", color: "text-gray-700", bgHover: "hover:bg-gray-50" },
                { text: "Notification Preferences", color: "text-gray-700", bgHover: "hover:bg-gray-50" },
                { text: "Delete Account", color: "text-red-600", bgHover: "hover:bg-red-50" },
              ].map((action, index) => (
                <button
                  key={index}
                  className={`w-full px-4 py-2 text-left text-sm ${action.color} ${action.bgHover} rounded-lg transform transition-all duration-200 hover:scale-105`}
                >
                  {action.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

// Editable Field Component
const EditableField = ({ 
  label, 
  value, 
  formValue, 
  field, 
  isEditing, 
  onChange, 
  startEdit, 
  editable = true,
  isLast = false 
}) => {
  const isEmpty = !value || value.trim() === "" || value === "Not specified";
  
  return (
    <div className={`flex justify-between items-center py-4 transform transition-all duration-200 ${!isLast ? 'border-b' : ''}`}>
      <div className="text-gray-600">{label}</div>
      {!isEditing ? (
        <div className="flex items-center gap-2">
          <div className="text-gray-900">
            {!isEmpty ? value : `Add ${label.toLowerCase()}`}
          </div>
          {isEmpty && editable && (
            <button
              onClick={startEdit}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transform transition-all duration-200 hover:scale-105"
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
          className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-all duration-200 focus:scale-105"
          placeholder={`Enter your ${label.toLowerCase()}`}
        />
      )}
    </div>
  );
};

// Read-only Field Component
const ReadOnlyField = ({ label, value }) => {
  const isEmpty = !value || value.trim() === "" || value === "Not specified";
  
  return (
    <div className="flex justify-between items-center border-b py-4 transform transition-all duration-200">
      <div className="text-gray-600 flex items-center gap-2">
        {label}
        <Lock className="w-3 h-3 text-gray-400" />
      </div>
      <div className="flex items-center gap-2">
        <div className="text-gray-500">
          {!isEmpty ? value : `${label} not provided`}
        </div>
      </div>
    </div>
  );
};

export default AboutMePanel;
