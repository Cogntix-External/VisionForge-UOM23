import React, { useState } from 'react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="max-w-6xl mx-auto -mt-6 relative z-10 px-4 pb-20">
      {/* Sub Nav Tab Bar */}
      <div className="bg-[#e5e7eb]/80 backdrop-blur p-2 rounded-[28px] flex mb-10 shadow-sm border border-white/40">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-4 text-xl font-bold rounded-[22px] transition-all ${activeTab === 'profile' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500'}`}
        >
          Profile
        </button>
        <button 
          onClick={() => setActiveTab('notification')}
          className={`flex-1 py-4 text-xl font-bold rounded-[22px] transition-all ${activeTab === 'notification' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500'}`}
        >
          Notification
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-4 text-xl font-bold rounded-[22px] transition-all ${activeTab === 'security' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500'}`}
        >
          Security
        </button>
      </div>

      <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 p-16 animate-in fade-in duration-300">
        {activeTab === 'profile' && (
          <div className="space-y-10">
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Profile Information</h3>
              <p className="text-gray-500 font-bold text-lg">Update your personal information and contact details</p>
            </div>
            <div className="grid grid-cols-1 gap-10 border border-gray-200 rounded-[32px] p-12">
               <div className="space-y-8">
                 <Field label="First Name" value="" />
                 <Field label="Last name" value="" />
                 <Field label="Email" value="" />
                 <Field label="Company" value="" />
                 <Field label="Phone number" value="" />
               </div>
            </div>
          </div>
        )}

        {activeTab === 'notification' && (
          <div className="space-y-10">
             <div>
               <h3 className="text-2xl font-black text-gray-900 mb-2">Notification Preferences</h3>
               <p className="text-gray-500 font-bold text-lg">Choose what updates you want to receive</p>
             </div>
             <div className="border border-gray-200 rounded-[32px] p-12 space-y-8">
               <ToggleItem title="Email Notifications" desc="Receive email updates about your projects" />
               <ToggleItem title="Change Request Updates" desc="Get notified when change requests are updated" />
               <ToggleItem title="Project Completion" desc="Notify me when projects are completed" />
               <ToggleItem title="Weekly Digest" desc="Receive a weekly summary of your projects" />
             </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-10">
            <div className="border border-gray-200 rounded-[32px] p-12 max-w-2xl">
              <h3 className="text-2xl font-black text-gray-900 mb-2">Change Password</h3>
              <p className="text-gray-500 font-bold text-lg mb-10">Update your password to keep your account secure</p>
              
              <div className="space-y-8 mb-12">
                <Field label="Current password" />
                <Field label="New password" />
                <Field label="Confirm new password" />
              </div>

              <button className="w-full py-6 bg-[#7c3aed] text-white text-2xl font-black rounded-3xl hover:bg-[#6d28d9] transition-all shadow-xl shadow-purple-200 active:scale-[0.98]">
                Update Password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label }) => (
  <div className="space-y-4">
    <label className="block text-xl font-bold text-gray-900">{label}</label>
    <input 
      type="text" 
      title={label}
      className="w-full px-6 py-5 bg-white border border-gray-300 rounded-2xl outline-none focus:ring-4 focus:ring-purple-100 transition-all"
    />
  </div>
);

const ToggleItem = ({ title, desc }) => {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="flex items-center justify-between p-8 bg-[#f9fafb] rounded-[24px] border border-gray-100">
      <div>
        <p className="text-xl font-black text-gray-900">{title}</p>
        <p className="text-lg text-gray-500 font-bold">{desc}</p>
      </div>
      <button 
        onClick={() => setEnabled(!enabled)}
        className={`w-[72px] h-[36px] rounded-full p-1 transition-colors relative ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}
      >
        <div className={`w-[28px] h-[28px] bg-white rounded-full shadow-md transition-all transform ${enabled ? 'translate-x-[36px]' : 'translate-x-0'}`} />
      </button>
    </div>
  );
};

export default Settings;
