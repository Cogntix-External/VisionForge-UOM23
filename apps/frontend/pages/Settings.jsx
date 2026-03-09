import React, { useState } from "react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    company: "Tech Corp",
    phone: "+1-555-0123",
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    crUpdates: true,
    weeklyDigest: false,
    deadline: true,
  });
  const [security, setSecurity] = useState({
    twoFactor: false,
    activityLog: true,
  });

  const handleProfileChange = (field, value) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleNotificationChange = (field) => {
    setNotifications({ ...notifications, [field]: !notifications[field] });
  };

  const handleSecurityChange = (field) => {
    setSecurity({ ...security, [field]: !security[field] });
  };

  const exportSettings = () => {
    const content = `SETTINGS EXPORT\n\nPROFILE:\n${Object.entries(profileData)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n")}\n\nNOTIFICATIONS:\n${Object.entries(notifications)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n")}\n\nSECURITY:\n${Object.entries(security)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n")}`;
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`,
    );
    element.setAttribute("download", "settings-export.txt");
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full max-w-7xl mx-auto -mt-6 relative z-10 px-4 pb-20">
      {/* Sub Nav Tab Bar */}
      <div className="bg-[#e5e7eb]/80 backdrop-blur p-2 rounded-[28px] flex mb-10 shadow-sm border border-white/40">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 py-4 text-xl font-bold rounded-[22px] transition-all ${activeTab === "profile" ? "bg-white shadow-md text-gray-900" : "text-gray-500"}`}
          aria-pressed={activeTab === "profile"}
          aria-label="Profile settings"
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("notification")}
          className={`flex-1 py-4 text-xl font-bold rounded-[22px] transition-all ${activeTab === "notification" ? "bg-white shadow-md text-gray-900" : "text-gray-500"}`}
          aria-pressed={activeTab === "notification"}
          aria-label="Notification settings"
        >
          Notification
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex-1 py-4 text-xl font-bold rounded-[22px] transition-all ${activeTab === "security" ? "bg-white shadow-md text-gray-900" : "text-gray-500"}`}
          aria-pressed={activeTab === "security"}
          aria-label="Security settings"
        >
          Security
        </button>
      </div>

      <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 p-16 animate-in fade-in duration-300">
        {activeTab === "profile" && (
          <div className="space-y-10">
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">
                Profile Information
              </h3>
              <p className="text-gray-500 font-bold text-lg">
                Update your personal information and contact details
              </p>
            </div>
            <div className="grid grid-cols-1 gap-10 border border-gray-200 rounded-[32px] p-12">
              <div className="space-y-8">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) =>
                      handleProfileChange("firstName", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) =>
                      handleProfileChange("lastName", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      handleProfileChange("email", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="company"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Company
                  </label>
                  <input
                    id="company"
                    type="text"
                    value={profileData.company}
                    onChange={(e) =>
                      handleProfileChange("company", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      handleProfileChange("phone", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>
            </div>
            <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition">
              💾 Save Changes
            </button>
          </div>
        )}

        {activeTab === "notification" && (
          <div className="space-y-10">
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">
                Notification Preferences
              </h3>
              <p className="text-gray-500 font-bold text-lg">
                Control how and when you receive notifications
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 border border-gray-200 rounded-xl">
                <div>
                  <h4 className="font-bold text-gray-900">
                    Email Notifications
                  </h4>
                  <p className="text-sm text-gray-500">
                    Receive updates via email
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailNotifications}
                  onChange={() =>
                    handleNotificationChange("emailNotifications")
                  }
                  className="w-6 h-6 rounded border-gray-300 cursor-pointer"
                  aria-label="Enable email notifications"
                />
              </div>
              <div className="flex items-center justify-between p-6 border border-gray-200 rounded-xl">
                <div>
                  <h4 className="font-bold text-gray-900">
                    Change Request Updates
                  </h4>
                  <p className="text-sm text-gray-500">
                    Get notified on CR status changes
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.crUpdates}
                  onChange={() => handleNotificationChange("crUpdates")}
                  className="w-6 h-6 rounded border-gray-300 cursor-pointer"
                  aria-label="Enable CR update notifications"
                />
              </div>
              <div className="flex items-center justify-between p-6 border border-gray-200 rounded-xl">
                <div>
                  <h4 className="font-bold text-gray-900">Weekly Digest</h4>
                  <p className="text-sm text-gray-500">
                    Receive weekly summary of activity
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.weeklyDigest}
                  onChange={() => handleNotificationChange("weeklyDigest")}
                  className="w-6 h-6 rounded border-gray-300 cursor-pointer"
                  aria-label="Enable weekly digest"
                />
              </div>
              <div className="flex items-center justify-between p-6 border border-gray-200 rounded-xl">
                <div>
                  <h4 className="font-bold text-gray-900">
                    Deadline Reminders
                  </h4>
                  <p className="text-sm text-gray-500">
                    Get notified about approaching deadlines
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.deadline}
                  onChange={() => handleNotificationChange("deadline")}
                  className="w-6 h-6 rounded border-gray-300 cursor-pointer"
                  aria-label="Enable deadline reminders"
                />
              </div>
            </div>
            <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition">
              💾 Save Preferences
            </button>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-10">
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">
                Security Settings
              </h3>
              <p className="text-gray-500 font-bold text-lg">
                Manage your account security and privacy
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 border border-gray-200 rounded-xl">
                <div>
                  <h4 className="font-bold text-gray-900">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-gray-500">
                    Add an extra layer of security
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={security.twoFactor}
                  onChange={() => handleSecurityChange("twoFactor")}
                  className="w-6 h-6 rounded border-gray-300 cursor-pointer"
                  aria-label="Enable two-factor authentication"
                />
              </div>
              <div className="flex items-center justify-between p-6 border border-gray-200 rounded-xl">
                <div>
                  <h4 className="font-bold text-gray-900">Activity Log</h4>
                  <p className="text-sm text-gray-500">
                    Monitor login and activity history
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={security.activityLog}
                  onChange={() => handleSecurityChange("activityLog")}
                  className="w-6 h-6 rounded border-gray-300 cursor-pointer"
                  aria-label="Enable activity log"
                />
              </div>
              <div className="p-6 border border-red-200 bg-red-50 rounded-xl">
                <h4 className="font-bold text-red-900 mb-2">Change Password</h4>
                <p className="text-sm text-red-700 mb-4">
                  Update your password regularly to keep your account secure
                </p>
                <button className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition">
                  🔐 Change Password
                </button>
              </div>
            </div>
            <button
              onClick={exportSettings}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition"
            >
              ⬇️ Export Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
