"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import UserProfileDropdown from "../pages/UserProfileDropdown";
import {
  getClientNotifications,
  getClientUnreadNotificationCount,
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
  ["/account-settings/password", "Change Password"],
  ["/account-settings", "Account Settings"],
  ["/user-management", "User Management"],
];

const TopNavbar = ({
  setSidebarOpen = () => {},
  title,
  desktopSidebarOpen = true,
  setDesktopSidebarOpen = () => {},
}) => {
  const pathname = usePathname();

  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  const getPageTitle = () => {
    if (title) {
      return title;
    }

    if (pathname === "/" || pathname === "/dashboard") {
      return "Dashboard";
    }

    const currentPage = pageTitles.find(([route]) =>
      pathname.startsWith(route),
    );
    return currentPage?.[1] || "Dashboard";
  };

  const loadUnreadCount = async () => {
    try {
      const data = await getClientUnreadNotificationCount();
      setNotificationCount(data?.count || 0);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await getClientNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const handleBellClick = async () => {
    setIsNotificationPanelOpen(true);
    await loadNotifications();
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id);
        await loadNotifications();
        await loadUnreadCount();
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  useEffect(() => {
    loadUnreadCount();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 shrink-0 border-b border-[var(--nav-border)] bg-[var(--nav-bg)] px-4 py-4 shadow-[0_1px_0_rgba(255,255,255,0.7)] sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 transition-colors hover:bg-white/70 lg:hidden"
            >
              <Menu className="h-6 w-6 text-[#4b5563]" />
            </button>

            <button
              type="button"
              onClick={() => setDesktopSidebarOpen((prev) => !prev)}
              className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/80 text-slate-600 transition hover:bg-white lg:inline-flex"
              title={desktopSidebarOpen ? "Hide navigation" : "Show navigation"}
            >
              {desktopSidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </button>

            <h1 className="text-xl font-normal text-[#1f2433]">
              {getPageTitle()}
            </h1>
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

            <UserProfileDropdown />
          </div>
        </div>
      </header>

      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        notifications={notifications}
        onClose={() => setIsNotificationPanelOpen(false)}
        onNotificationClick={handleNotificationClick}
      />

      <NotificationToastManager />
    </>
  );
};

export default TopNavbar;
