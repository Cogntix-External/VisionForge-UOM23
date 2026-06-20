import React, { useEffect, useState } from "react";
import { Icons } from "../constants";
import { getClientUnreadNotificationCount } from "../services/api";

const Header = ({
  title,
  subtitle,
  showNotifications,
  onToggleNotifications,
  onNavigateSettings,
  onLogout,
  onProfileClick,
  user,
  role,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (role === "CLIENT") {
      loadNotifications();
    }
  }, [role]);

  const loadNotifications = async () => {
    try {
      const res = await getClientUnreadNotificationCount();
      setCount(res || 0);
    } catch (e) {
      console.error("Notification count error:", e);
    }
  };

  return (
    <header className="relative z-20 border-b border-slate-200 bg-white/85 backdrop-blur-xl shadow-[0_10px_40px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950/75 dark:text-white">
      <div className="flex items-center justify-between px-6 py-5 md:px-10">
        
        {/* LEFT SECTION */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg">
            <Icons.Documents />
          </div>

          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl dark:text-white">
              {title}
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
              {subtitle}
            </p>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-4">

          {/* SETTINGS */}
          <button
            onClick={onNavigateSettings}
            className="group flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <div className="transition-transform group-hover:rotate-45">
              <Icons.Settings />
            </div>
          </button>

          {/* NOTIFICATIONS */}
          <button
            onClick={onToggleNotifications}
            className={`relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-0.5 ${
              showNotifications
                ? "bg-indigo-50 dark:bg-indigo-950/40"
                : "dark:bg-slate-900"
            }`}
          >
            <Icons.Notification />

            {/* Badge */}
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow">
                {count}
              </span>
            )}
          </button>

          {/* USER PROFILE */}
          <button
            onClick={onProfileClick}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            title="Profile"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 font-bold text-white">
              {user?.name?.charAt(0) || "U"}
            </div>

            <div className="hidden flex-col text-left md:flex">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {user?.name || "User"}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-300">{role}</span>
            </div>
          </button>

        </div>
      </div>
    </header>
  );
};

export default Header;