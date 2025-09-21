import React, { useState } from "react";
import ToggleSwitch from "./ToggleSwitch";

// TODO: Replace with API call when backend is ready
const dummyUserSettings = {
  profile: {
    firstName: "Priya Sharma",
  },
  email: "priya@example.com",
  phone: "+91-9876543210",
  preferences: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    bookingReminders: true,
    reviewReminders: true
  }
};

const SettingsPanel = () => {
  const [settings, setSettings] = useState(dummyUserSettings);
  const [isEditing, setIsEditing] = useState({
    email: false,
    phone: false
  });

  const handleToggle = (key) => {
    // TODO: Call API to update user preferences
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key]
      }
    }));
    console.log(`Updated ${key} to:`, !settings.preferences[key]);
  };

  const handleSave = (field, value) => {
    // TODO: Call API to update user info
    setSettings(prev => ({ ...prev, [field]: value }));
    setIsEditing(prev => ({ ...prev, [field]: false }));
    console.log(`Updated ${field} to:`, value);
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
              <span>Name</span>
              <span className="text-gray-600">{settings.profile.firstName}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Email</span> 
              {isEditing.email ? (
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    defaultValue={settings.email}
                    className="px-3 py-1 border rounded"
                    onBlur={(e) => handleSave('email', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSave('email', e.target.value)}
                    autoFocus
                  />
                  <button 
                    onClick={() => setIsEditing(prev => ({ ...prev, email: false }))}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">{settings.email}</span>
                  <button 
                    onClick={() => setIsEditing(prev => ({ ...prev, email: true }))}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span>Phone</span>
              {isEditing.phone ? (
                <div className="flex gap-2">
                  <input 
                    type="tel" 
                    defaultValue={settings.phone}
                    className="px-3 py-1 border rounded"
                    onBlur={(e) => handleSave('phone', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSave('phone', e.target.value)}
                    autoFocus
                  />
                  <button 
                    onClick={() => setIsEditing(prev => ({ ...prev, phone: false }))}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">{settings.phone}</span>
                  <button 
                    onClick={() => setIsEditing(prev => ({ ...prev, phone: true }))}
                    className="text-gray-500 hover:text-gray-700 text-sm"
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
