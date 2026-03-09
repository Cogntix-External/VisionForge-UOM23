import React from "react";
import { Icons } from "../constants";

const Header = ({
  title,
  subtitle,
  showNotifications,
  onToggleNotifications,
  onNavigateSettings,
  onLogout,
}) => {
  return (
    <header className="bg-gradient-to-r from-[#7c3aed] via-[#a78bfa] to-[#c084fc] h-[120px] flex items-center px-10 text-white shrink-0 shadow-md">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/20">
            <Icons.Documents />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-0.5">
              {title}
            </h2>
            <p className="text-white/90 text-lg font-medium opacity-90">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <button
            onClick={onNavigateSettings}
            className="p-3 hover:bg-white/20 rounded-full transition-all group"
          >
            <div className="transform group-hover:rotate-45 transition-transform duration-300">
              <Icons.Settings />
            </div>
          </button>
          <button
            onClick={onToggleNotifications}
            className={`p-3 hover:bg-white/20 rounded-full transition-all relative ${
              showNotifications ? "bg-white/30" : ""
            }`}
          >
            <Icons.Notification />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button
            onClick={onLogout}
            className="bg-[#111827]/40 rounded-full p-2 border border-white/40 cursor-pointer hover:bg-white/20 transition-all shadow-lg"
            title="Sign Out"
          >
            <Icons.User />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
