import React from "react";
import { Icons } from "../constants";
import logo from "../assets/images/logo.jpeg";

const Sidebar = ({
  activePage,
  onNavigate,
  mode,
  onToggleMode,
  onLogout,
  user,
  role,
}) => {
  const isCollapsed = mode === "collapsed";
  const userName = user?.fullName || user?.name || "User";
  const userEmail = user?.email || "";
  const portalName = role === "COMPANY" ? "Company Portal" : "Client Portal";

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Icons.Dashboard },
    {
      id: "projects",
      label: role === "COMPANY" ? "Projects" : "My Projects",
      icon: Icons.Projects,
    },
    { id: "proposals", label: "Proposals", icon: Icons.Proposals },
    { id: "documents", label: "Documents", icon: Icons.Documents },
    {
      id: "change-requests",
      label: "Change Requests",
      icon: Icons.ChangeRequests,
    },
    { id: "kanban", label: "Kanban Board", icon: Icons.Kanban },
  ];

  return (
    <aside
      className={`relative z-20 flex h-full shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-900 shadow-[30px_0_80px_rgba(15,23,42,0.10)] transition-all duration-300 dark:border-white/10 dark:bg-gradient-to-b dark:from-[#020617] dark:via-[#0f172a] dark:to-[#111827] dark:text-white dark:shadow-[30px_0_80px_rgba(15,23,42,0.45)] ${
        isCollapsed ? "w-[96px]" : "w-[292px]"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.10),_transparent_32%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.06),_transparent_38%)] dark:bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.35),_transparent_32%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.18),_transparent_38%)]" />

      <div
        className={`relative flex items-center gap-4 px-6 py-7 ${
          isCollapsed ? "flex-col" : "justify-between"
        }`}
      >
        <div
          className={`flex min-w-0 items-center ${
            isCollapsed ? "flex-col gap-3" : "gap-4"
          }`}
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-950 p-2 shadow-2xl dark:border-white/10 dark:bg-white">
            <img
              src={logo}
              alt="CRMS Logo"
              className="h-full w-full rounded-xl object-contain"
            />
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="text-xl font-black uppercase tracking-tight">
                CRMS
              </h1>
              <p className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.28em] text-indigo-600 dark:text-indigo-300">
                {portalName}
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleMode}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-xl backdrop-blur-xl transition hover:scale-105 hover:bg-slate-100 active:scale-95 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          title="Toggle sidebar"
        >
          <svg
            className={`h-5 w-5 transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M15 19l-7-7 7-7"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <div className="relative mx-5 mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            Signed in as
          </p>
          <p className="mt-2 truncate text-sm font-black text-slate-900 dark:text-white">
            {userName}
          </p>
          <p className="mt-1 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
            {userEmail}
          </p>
        </div>
      )}

      <nav
        className={`relative flex flex-1 flex-col gap-2 overflow-y-auto py-3 ${
          isCollapsed ? "px-3" : "px-5"
        }`}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              title={isCollapsed ? item.label : ""}
              className={`group relative flex items-center rounded-2xl font-bold transition-all duration-300 ${
                isCollapsed
                  ? "h-14 justify-center px-0"
                  : "gap-4 px-4 py-4 text-left"
              } ${
                isActive
                  ? "bg-slate-950 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)] dark:bg-white dark:text-slate-950 dark:shadow-[0_18px_45px_rgba(255,255,255,0.18)]"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.9)]" />
              )}

              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                  isActive
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-900 dark:bg-white/5 dark:text-slate-400 dark:group-hover:bg-white/10 dark:group-hover:text-white"
                }`}
              >
                <Icon />
              </span>

              {!isCollapsed && (
                <span className="truncate text-sm">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="relative border-t border-slate-200 p-5 dark:border-white/10">
        <button
          type="button"
          onClick={onLogout}
          className={`flex w-full items-center rounded-2xl border border-slate-200 bg-slate-950 font-black text-white shadow-xl backdrop-blur-xl transition hover:scale-[1.02] hover:bg-red-500/20 active:scale-95 dark:border-white/10 dark:bg-white/10 dark:text-white ${
            isCollapsed ? "h-14 justify-center" : "gap-4 px-4 py-4"
          }`}
          title={isCollapsed ? "Sign Out" : ""}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 dark:bg-white/10">
            <Icons.User />
          </span>

          {!isCollapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;