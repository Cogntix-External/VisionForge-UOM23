"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  RotateCcw,
  Save,
} from "lucide-react";
import Layout from "./Layout";

const INITIAL_NOTIFICATIONS = {
  emailNotifications: true,
  systemNotifications: true,
  newUserLogin: true,
  clientRequestUpdates: true,
  taskReminders: false,
  projectUpdates: true,
};

const AccountSettingPage = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const handleToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleReset = () => {
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  const handleSave = () => {
    alert("Settings updated successfully");
  };

  return (
    <Layout title="Account Settings">
      <div className="flex h-full min-h-0 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-[920px] px-2 py-2">
          <SettingsSection title="Security">
            <Link
              href="/account-settings/password"
              className="flex items-center justify-between py-5 transition hover:bg-slate-50/70"
            >
              <span className="text-[15px] text-slate-900">Password</span>
              <div className="flex items-center gap-3 text-slate-500">
                <span className="text-sm tracking-[0.18em]">******</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Link>
          </SettingsSection>

          <SettingsSection title="Notifications">
            <ToggleItem
              title="Email Notifications"
              enabled={notifications.emailNotifications}
              onClick={() => handleToggle("emailNotifications")}
            />
            <ToggleItem
              title="System Notifications"
              enabled={notifications.systemNotifications}
              onClick={() => handleToggle("systemNotifications")}
            />
            <ToggleItem
              title="New User Login"
              enabled={notifications.newUserLogin}
              onClick={() => handleToggle("newUserLogin")}
            />
            <ToggleItem
              title="Client Request Updates"
              enabled={notifications.clientRequestUpdates}
              onClick={() => handleToggle("clientRequestUpdates")}
            />
            <ToggleItem
              title="Task Reminders"
              enabled={notifications.taskReminders}
              onClick={() => handleToggle("taskReminders")}
            />
            <ToggleItem
              title="Project Updates"
              enabled={notifications.projectUpdates}
              onClick={() => handleToggle("projectUpdates")}
              isLast
            />
          </SettingsSection>

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const SettingsSection = ({ title, children }) => {
  return (
    <section className="border-b border-slate-200 py-1 last:border-b-0">
      <h2 className="pb-4 text-[18px] font-medium text-slate-900">{title}</h2>
      <div>{children}</div>
    </section>
  );
};

const ToggleItem = ({ title, enabled, onClick, isLast = false }) => {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-5 ${
        isLast ? "" : "border-t border-slate-200"
      }`}
    >
      <div>
        <p className="text-[15px] text-slate-900">{title}</p>
      </div>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={enabled}
        aria-label={`${title} ${enabled ? "enabled" : "disabled"}`}
        className={`flex h-7 w-12 shrink-0 items-center rounded-full px-1 transition ${
          enabled ? "justify-end bg-[#2563eb]" : "justify-start bg-slate-300"
        }`}
      >
        <span className="h-5 w-5 rounded-full bg-white" />
      </button>
    </div>
  );
};

export default AccountSettingPage;