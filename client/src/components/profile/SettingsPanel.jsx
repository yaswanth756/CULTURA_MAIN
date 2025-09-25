import React, { useState, useEffect } from "react";
import axios from "axios";
import { buildApiUrl } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import ToggleSwitch from "./ToggleSwitch";
import { Check, X, Loader2 } from "lucide-react";

const Skeleton = ({ className }) => (
  <div className={`bg-gray-200 rounded-md animate-pulse ${className}`} />
);

const SettingsPanel = () => {
  const { user, setUser } = useAuth();
  const [settings, setSettings] = useState(null);
  const [originalSettings, setOriginalSettings] = useState(null);
  const [isEditing, setIsEditing] = useState({
    email: false,
    phone: false
  });
  const [isSaving, setIsSaving] = useState({
    email: false,
    phone: false
  });

  useEffect(() => {
    if (user) {
      const userSettings = {
        profile: {
          firstName: user.firstName || "",
        },
        email: user.email || "",
        phone: user.phone || "",
        preferences: user.preferences || {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          marketingEmails: false,
          bookingReminders: true,
          reviewReminders: true,
        },
      };
      setSettings(userSettings);
      setOriginalSettings(userSettings);
    }
  }, [user]);

  const handleToggle = async (key) => {
    const newPreferences = {
      ...settings.preferences,
      [key]: !settings.preferences[key],
    };

    // Optimistic UI update
    setSettings((prev) => ({
      ...prev,
      preferences: newPreferences,
    }));

    try {
      await axios.put(buildApiUrl("/api/auth/profile/preferences"), { preferences: newPreferences });
      // Update user in global context
      setUser(prevUser => ({ ...prevUser, preferences: newPreferences }));
    } catch (error) {
      console.error(`Failed to update ${key}`, error);
      // Revert on error
      setSettings((prev) => ({
        ...prev,
        preferences: prev.preferences,
      }));
      // Optionally show an error toast
    }
  };

  const handleSave = async (field, value) => {
    if (value === originalSettings[field]) {
      setIsEditing(prev => ({ ...prev, [field]: false }));
      return;
    }

    setIsSaving(prev => ({ ...prev, [field]: true }));
    try {
      const response = await axios.put(buildApiUrl("/api/auth/profile"), { [field]: value });
      if (response.data.success) {
        setUser(response.data.data); // Update global user state
      }
    } catch (error) {
      console.error(`Failed to update ${field}`, error);
      setSettings(originalSettings); // Revert on error
      // Optionally show an error toast
    } finally {
      setIsEditing(prev => ({ ...prev, [field]: false }));
      setIsSaving(prev => ({ ...prev, [field]: false }));
    }
  };

  return (
    <div data-aos="fade-up" className="max-w-4xl">
      <h2 className="text-3xl font-semibold mb-8">Account settings</h2>
      
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Personal information</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Name</span>
              {settings ? (
                <span className="font-medium text-gray-800">{settings.profile.firstName}</span>
              ) : (
                <Skeleton className="h-5 w-28" />
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Email</span> 
              {!settings ? (
                <Skeleton className="h-5 w-40" />
              ) : isEditing.email ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="email" 
                    defaultValue={settings.email}
                    className="px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && handleSave('email', e.target.value)}
                    autoFocus
                  />
                  {isSaving.email ? (
                    <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                  ) : (
                    <>
                      <button onClick={() => handleSave('email', document.querySelector('input[type="email"]').value)} className="text-green-600 hover:text-green-800"><Check className="w-4 h-4" /></button>
                      <button onClick={() => { setIsEditing(prev => ({ ...prev, email: false })); setSettings(originalSettings); }} className="text-red-600 hover:text-red-800"><X className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{settings.email}</span>
                  <button 
                    onClick={() => setIsEditing(prev => ({ ...prev, email: true }))}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Phone</span>
              {!settings ? (
                <Skeleton className="h-5 w-32" />
              ) : isEditing.phone ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="tel" 
                    defaultValue={settings.phone}
                    className="px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && handleSave('phone', e.target.value)}
                    autoFocus
                  />
                  {isSaving.phone ? (
                    <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                  ) : (
                    <>
                      <button onClick={() => handleSave('phone', document.querySelector('input[type="tel"]').value)} className="text-green-600 hover:text-green-800"><Check className="w-4 h-4" /></button>
                      <button onClick={() => { setIsEditing(prev => ({ ...prev, phone: false })); setSettings(originalSettings); }} className="text-red-600 hover:text-red-800"><X className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{settings.phone}</span>
                  <button 
                    onClick={() => setIsEditing(prev => ({ ...prev, phone: true }))}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Notification preferences</h3>
          {settings ? (
            <div className="space-y-4">
              <ToggleSwitch 
                label="Email notifications" 
                checked={settings.preferences.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
              />
              <ToggleSwitch 
                label="SMS notifications" 
                checked={settings.preferences.smsNotifications}
                onChange={() => handleToggle('smsNotifications')}
              />
              <ToggleSwitch 
                label="Push notifications" 
                checked={settings.preferences.pushNotifications}
                onChange={() => handleToggle('pushNotifications')}
              />
              <ToggleSwitch 
                label="Marketing emails" 
                checked={settings.preferences.marketingEmails}
                onChange={() => handleToggle('marketingEmails')}
              />
              <ToggleSwitch 
                label="Booking reminders" 
                checked={settings.preferences.bookingReminders}
                onChange={() => handleToggle('bookingReminders')}
              />
              <ToggleSwitch 
                label="Review reminders" 
                checked={settings.preferences.reviewReminders}
                onChange={() => handleToggle('reviewReminders')}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          )}
        </div>

        {/* Privacy & Security */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Privacy & Security</h3>
          <div className="space-y-4">
            <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border">
              <div className="font-medium">Change Password</div>
              <div className="text-sm text-gray-600">Update your account password</div>
            </button>
            <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border">
              <div className="font-medium">Two-Factor Authentication</div>
              <div className="text-sm text-gray-600">Add an extra layer of security</div>
            </button>
            <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border">
              <div className="font-medium">Download My Data</div>
              <div className="text-sm text-gray-600">Get a copy of your account data</div>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h3>
          <div className="space-y-3">
            <button 
              onClick={() => alert("Account deactivation feature coming soon!")}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Deactivate Account
            </button>
            <div className="text-sm text-red-600">
              This will temporarily disable your account. You can reactivate it anytime.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
