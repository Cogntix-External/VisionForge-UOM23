"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Menu, PanelLeftClose, PanelLeftOpen, User } from "lucide-react";
import UserProfileDropdown from "../pages/UserProfileDropdown";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
} from "../services/api";
import NotificationPanel from "./NotificationPanel";
import NotificationToastManager from "./NotificationToastManager";

const pageTitles = [
  ["/company/DashboardSection", "Company Dashboard"],
  ["/company/PrdRepository", "PRD Repository"],
  ["/company/Prd-details&Editor", "PRD Details & Editors"],
  ["/company/ProposalsListSection", "Project Proposals"],
  ["/company/CreateProposalSection", "Create Project Proposal"],
  ["/company/KanbanOverviewPage", "Kanban Board Overview"],
  ["/company/KanbanBoardPage", "Kanban Board"],
  ["/company/Audit-trail", "Audit Trail & Full History"],
  ["/company/Version-history", "Version History"],
  ["/client/dashboard", "Client Dashboard"],
  ["/client/Project", "Projects"],
  ["/client/ProposalDetailsSection", "Proposal Details"],
  ["/client/Proposal", "Project Proposals"],
  ["/client/Document", "Documents"],
  ["/client/ChangeRequest", "Change Requests"],
  ["/client/Kanban", "Kanban Board"],
  ["/company/ChangePasswordPage", "Change Password"],
  ["/user-management", "User Management"],
];

const TopNavbar = ({
  setSidebarOpen = () => {},
  section = "company",
  title,
  desktopSidebarOpen = true,
  setDesktopSidebarOpen = () => {},
}) {
  const pathname = usePathname();

  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [openPanel, setOpenPanel] = useState(false);

  const getTitle = () => {
    const path = String(pathname || "").toLowerCase();

    if (path.includes("/company/dashboardsection")) return "Company Dashboard";
    if (path.includes("/company/proposalslistsection")) return "Proposals";
    if (path.includes("/company/createproposalsection")) return "Create Proposal";
    if (path.includes("/company/prdrepository")) return "PRD Repository";
    if (path.includes("/company/prd-details&editor")) return "PRD Details & Editor";
    if (path.includes("/company/proposaldetailssection")) return "Proposal Details";
    if (path.includes("/company/kanbanoverviewpage")) return "Kanban Overview";
    if (path.includes("/company/kanbanboardpage")) return "Kanban Board";
    if (path.includes("/company/kanban")) return "Kanban";
    if (path.includes("/company/audit-trail")) return "Audit Trail";
    if (path.includes("/company/version-history")) return "Version History";

    if (path.includes("/client/dashboard")) return "Client Dashboard";
    if (path.includes("/client/proposal")) return "Project Proposals";
    if (path.includes("/client/projectdetailssection")) return "Project Details";
    if (path.includes("/client/project")) return "Project Details";
    if (path.includes("/client/projectdetails")) return "Project Details";
    if (path.includes("/client/changerequest")) return "Change Requests";
    if (path.includes("/client/document")) return "Documents";
    if (path.includes("/client/kanban")) return "Kanban";

    return "Dashboard";
  };

  const loadCount = async () => {
    try {
      const data = await getUnreadNotificationCount();
      setCount(data?.count || 0);
    } catch {}
  };

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data || []);
    } catch {}
  };

  const handleBell = async () => {
    setOpenPanel(true);
    await loadNotifications();
  };

  const handleClick = async (notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      await loadNotifications();
      await loadCount();
    }
  };

  useEffect(() => {
    loadCount();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/90 px-6 py-4 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 transition hover:bg-gray-100 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu />
          </button>

          <button
            onClick={() => setDesktopSidebarOpen((prev) => !prev)}
            className="hidden rounded-lg p-2 transition hover:bg-gray-100 lg:flex"
            aria-label="Toggle sidebar"
          >
            {desktopSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
          </button>

          <h1 className="text-xl font-bold text-gray-800">{getTitle()}</h1>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative">
            <button
              onClick={handleBell}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition hover:bg-gray-200"
              aria-label="Open notifications"
            >
              <Bell size={18} />
            </button>

            {count > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-2 py-[2px] text-xs font-bold text-white">
                {count}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={handleBellClick}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 transition hover:bg-white"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>

              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {notificationCount}
                </span>
              )}
            </div>
 {section === "company" ? (
              <UserProfileDropdown />
            ) : (
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600"
                title="User"
              >
                <User className="h-5 w-5" />
              </div>
            )}
          </div>
        </div>
      </header>

      <NotificationPanel
        isOpen={openPanel}
        notifications={notifications}
        onClose={() => setOpenPanel(false)}
        onNotificationClick={handleClick}
      />

      <NotificationToastManager />
    </>
  );
}