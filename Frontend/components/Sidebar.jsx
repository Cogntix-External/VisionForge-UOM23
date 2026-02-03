import React from "react";
import { Icons } from "../constants";
import CRMSLogo from "../assets/CRMSLogo";

const Sidebar = ({ activePage, onNavigate, mode, onToggleMode, onLogout, user }) => {
  const isCollapsed = mode === "collapsed";
  const userName = user?.fullName || user?.name || "User";
  const userEmail = user?.email || "";

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Icons.Dashboard },
    { id: "projects", label: "My Projects", icon: Icons.Projects },
    { id: "documents", label: "Documents", icon: Icons.Documents },
    {
      id: "change-requests",
      label: "Change Requests",
      icon: Icons.ChangeRequests,
    },
    { id: "kanban", label: "Kanban", icon: Icons.Kanban },
  ];

  return (
    <aside
      className={`h-full bg-[#111827] text-white flex flex-col shrink-0 border-r border-white/5 transition-all duration-300 ${
        isCollapsed ? "w-[100px]" : "w-[280px]"
      }`}
    >
      {/* Sidebar Header / Logo */}
      <div
        className={`p-8 flex items-center ${
          isCollapsed ? "flex-col space-y-8" : "justify-between space-x-4"
        } w-full`}
      >
        <div
          className={`flex items-center ${
            isCollapsed ? "flex-col" : "flex-row"
          }`}
        >
          <CRMSLogo className="w-14 h-14 shrink-0" />
          {!isCollapsed && (
            <div className="ml-4">
              <h1 className="font-black text-xl leading-none uppercase tracking-tighter text-white">
                CRMS
              </h1>
              <p className="text-[#9ca3af] text-[10px] font-bold mt-1 uppercase tracking-widest">
                Client Portal
              </p>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={onToggleMode}
          className="bg-[#5c67d7] w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#4a55c8] transition-all shadow-xl active:scale-95 group shrink-0"
          title="Toggle sidebar"
        >
          <svg
            className={`w-6 h-6 text-[#d1d5db] transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M15 19l-7-7 7-7"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav
        className={`flex-1 flex flex-col items-center py-4 space-y-8 ${
          isCollapsed ? "px-0" : "px-4"
        }`}
      >
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            title={isCollapsed ? item.label : ""}
            className={`flex items-center transition-all duration-200 group relative ${
              isCollapsed
                ? "justify-center w-full py-2"
                : "w-full space-x-4 px-6 py-4 rounded-xl"
            } ${
              activePage === item.id
                ? isCollapsed
                  ? "text-[#818cf8]"
                  : "bg-[#1f2937] text-white border border-white/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <div
              className={`p-1 ${
                activePage === item.id
                  ? "transform scale-110"
                  : "opacity-60 group-hover:opacity-100"
              }`}
            >
              <item.icon />
            </div>
            {!isCollapsed && (
              <span
                className={`font-bold text-lg ${
                  activePage === item.id
                    ? "text-white"
                    : "text-gray-400 group-hover:text-white"
                }`}
              >
                {item.label}
              </span>
            )}
            {/* Active Indicator Bar for Collapsed mode */}
            {isCollapsed && activePage === item.id && (
              <div className="absolute left-0 w-1.5 h-10 bg-[#818cf8] rounded-r-full shadow-[0_0_15px_rgba(129,140,248,0.5)]"></div>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom User Profile */}
      <div
        className={`p-8 border-t border-white/5 mt-auto flex flex-col items-center ${
          isCollapsed ? "space-y-6" : "space-y-4"
        }`}
      >
        <button
          onClick={onLogout}
          className={`flex items-center transition-all duration-200 w-full ${
            isCollapsed ? "justify-center" : "space-x-4"
          } hover:opacity-80`}
          title={isCollapsed ? "Sign Out" : ""}
        >
          <div className="bg-[#1f2937] p-3 rounded-2xl border border-white/10 shadow-lg cursor-pointer hover:border-purple-400 transition-all">
            <Icons.User />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1 text-left">
              <span className="text-sm font-black truncate">{userName}</span>
              <span className="text-xs text-gray-500 font-bold truncate">
                {userEmail}
              </span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
