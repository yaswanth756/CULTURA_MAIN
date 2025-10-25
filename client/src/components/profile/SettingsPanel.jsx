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

    setSettings((prev) => ({
      ...prev,
      preferences: newPreferences,
    }));

    try {
      await axios.put(buildApiUrl("/api/auth/profile/preferences"), { preferences: newPreferences });
      setUser(prevUser => ({ ...prevUser, preferences: newPreferences }));
    } catch (error) {
      console.error(`Failed to update ${key}`, error);
      setSettings((prev) => ({
        ...prev,
        preferences: prev.preferences,
      }));
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
        setUser(response.data.data);
      }
    } catch (error) {
      console.error(`Failed to update ${field}`, error);
      setSettings(originalSettings);
    } finally {
      setIsEditing(prev => ({ ...prev, [field]: false }));
      setIsSaving(prev => ({ ...prev, [field]: false }));
    }
  };

  return (
    <div data-aos="fade-up" className="max-w-4xl">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-6 sm:mb-8">Account settings</h2>
      
      <div className="space-y-4 sm:space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Personal information</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <span className="text-sm sm:text-base text-gray-600">Name</span>
              {settings ? (
                <span className="font-medium text-sm sm:text-base text-gray-800">{settings.profile.firstName}</span>
              ) : (
                <Skeleton className="h-5 w-28" />
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <span className="text-sm sm:text-base text-gray-600">Email</span> 
              {!settings ? (
                <Skeleton className="h-5 w-40" />
              ) : isEditing.email ? (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input 
                    type="email" 
                    defaultValue={settings.email}
                    className="flex-1 sm:flex-none sm:w-64 px-3 py-2 min-h-[44px] text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && handleSave('email', e.target.value)}
                    autoFocus
                  />
                  {isSaving.email ? (
                    <Loader2 className="w-5 h-5 text-gray-500 animate-spin flex-shrink-0" />
                  ) : (
                    <>
                      <button onClick={() => handleSave('email', document.querySelector('input[type="email"]').value)} className="min-w-[36px] min-h-[36px] flex items-center justify-center text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition"><Check className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                      <button onClick={() => { setIsEditing(prev => ({ ...prev, email: false })); setSettings(originalSettings); }} className="min-w-[36px] min-h-[36px] flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-between sm:justify-start">
                  <span className="font-medium text-sm sm:text-base text-gray-800 truncate">{settings.email}</span>
                  <button 
                    onClick={() => setIsEditing(prev => ({ ...prev, email: true }))}
                    className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium whitespace-nowrap min-h-[32px] px-2"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <span className="text-sm sm:text-base text-gray-600">Phone</span>
              {!settings ? (
                <Skeleton className="h-5 w-32" />
              ) : isEditing.phone ? (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input 
                    type="tel" 
                    defaultValue={settings.phone}
                    className="flex-1 sm:flex-none sm:w-64 px-3 py-2 min-h-[44px] text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && handleSave('phone', e.target.value)}
                    autoFocus
                  />
                  {isSaving.phone ? (
                    <Loader2 className="w-5 h-5 text-gray-500 animate-spin flex-shrink-0" />
                  ) : (
                    <>
                      <button onClick={() => handleSave('phone', document.querySelector('input[type="tel"]').value)} className="min-w-[36px] min-h-[36px] flex items-center justify-center text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition"><Check className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                      <button onClick={() => { setIsEditing(prev => ({ ...prev, phone: false })); setSettings(originalSettings); }} className="min-w-[36px] min-h-[36px] flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-between sm:justify-start">
                  <span className="font-medium text-sm sm:text-base text-gray-800">{settings.phone}</span>
                  <button 
                    onClick={() => setIsEditing(prev => ({ ...prev, phone: true }))}
                    className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium whitespace-nowrap min-h-[32px] px-2"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Notification preferences</h3>
          {settings ? (
            <div className="space-y-3 sm:space-y-4">
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
            <div className="space-y-3 sm:space-y-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          )}
        </div>

        {/* Privacy & Security */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Privacy & Security</h3>
          <div className="space-y-3 sm:space-y-4">
            <button className="w-full text-left p-3 sm:p-4 min-h-[64px] hover:bg-gray-50 rounded-lg border transition">
              <div className="font-medium text-sm sm:text-base">Change Password</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Update your account password</div>
            </button>
            <button className="w-full text-left p-3 sm:p-4 min-h-[64px] hover:bg-gray-50 rounded-lg border transition">
              <div className="font-medium text-sm sm:text-base">Two-Factor Authentication</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Add an extra layer of security</div>
            </button>
            <button className="w-full text-left p-3 sm:p-4 min-h-[64px] hover:bg-gray-50 rounded-lg border transition">
              <div className="font-medium text-sm sm:text-base">Download My Data</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Get a copy of your account data</div>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-3 sm:mb-4">Danger Zone</h3>
          <div className="space-y-3">
            <button 
              onClick={() => alert("Account deactivation feature coming soon!")}
              className="text-red-600 hover:text-red-800 font-medium text-sm sm:text-base min-h-[44px] px-2"
            >
              Deactivate Account
            </button>
            <div className="text-xs sm:text-sm text-red-600">
              This will temporarily disable your account. You can reactivate it anytime.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
