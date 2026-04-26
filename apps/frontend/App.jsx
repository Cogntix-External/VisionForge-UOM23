import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ChangeRequests from "./pages/ChangeRequests";
import Proposals from "./pages/Proposals";
import Kanban from "./pages/Kanban";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Documents from "./pages/Documents";

const ROLE = {
  CLIENT: "CLIENT",
  COMPANY: "COMPANY",
};

const PAGE_ACCESS = {
  dashboard: [ROLE.CLIENT, ROLE.COMPANY],
  projects: [ROLE.CLIENT, ROLE.COMPANY],
  documents: [ROLE.CLIENT, ROLE.COMPANY],
  "change-requests": [ROLE.CLIENT, ROLE.COMPANY],
  proposals: [ROLE.CLIENT, ROLE.COMPANY],
  kanban: [ROLE.CLIENT, ROLE.COMPANY],
  notifications: [ROLE.CLIENT, ROLE.COMPANY],
  settings: [ROLE.CLIENT, ROLE.COMPANY],
};

const PAGE_INFO = {
  CLIENT: {
    dashboard: {
      title: "Client Dashboard",
      subtitle: "Welcome back! Here is your project and request overview.",
    },
    projects: {
      title: "Projects",
      subtitle: "View accepted projects and their current progress.",
    },
    documents: {
      title: "Project Documents",
      subtitle: "View and download PRDs and related project files.",
    },
    "change-requests": {
      title: "Change Requests",
      subtitle: "Create and track your project change requests.",
    },
    proposals: {
      title: "Project Proposals",
      subtitle: "Review company proposals and accept or reject them.",
    },
    kanban: {
      title: "Client Kanban Board",
      subtitle: "Track your full project workflow and progress.",
    },
    notifications: {
      title: "Notifications",
      subtitle: "See proposal updates, document uploads, and decisions.",
    },
    settings: {
      title: "Settings",
      subtitle: "Manage your account settings and preferences.",
    },
  },
  COMPANY: {
    dashboard: {
      title: "Company Dashboard",
      subtitle: "Manage proposals, projects, and delivery progress.",
    },
    projects: {
      title: "Company Projects",
      subtitle: "Manage all approved and active client projects.",
    },
    documents: {
      title: "Project Requirement Documents",
      subtitle: "Upload PRDs and manage project documentation.",
    },
    "change-requests": {
      title: "Change Requests",
      subtitle: "Review client change requests and take action.",
    },
    proposals: {
      title: "Project Proposals",
      subtitle: "Create and manage proposals sent to clients.",
    },
    kanban: {
      title: "Company Kanban Board",
      subtitle: "Manage tasks and monitor team progress visually.",
    },
    notifications: {
      title: "Notifications",
      subtitle: "Stay updated on approvals, uploads, and requests.",
    },
    settings: {
      title: "Settings",
      subtitle: "Manage company profile and portal preferences.",
    },
  },
};

const DEFAULT_PAGE_BY_ROLE = {
  CLIENT: "dashboard",
  COMPANY: "dashboard",
};

const normalizeRole = (role) => {
  if (!role) return "";

  const value = String(role).trim().toUpperCase();

  if (value === "ROLE_CLIENT") return "CLIENT";
  if (value === "ROLE_COMPANY") return "COMPANY";

  return value;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarMode, setSidebarMode] = useState("collapsed");

  useEffect(() => {
    const storedToken = localStorage.getItem("crms_token");
    const storedUser = localStorage.getItem("crms_user");
    const savedSidebarMode = localStorage.getItem("crms_sidebar_mode");
    const savedActivePage = localStorage.getItem("crms_active_page");

    if (savedSidebarMode === "expanded" || savedSidebarMode === "collapsed") {
      setSidebarMode(savedSidebarMode);
    }

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser?.role) {
          const normalizedUserRole = normalizeRole(parsedUser.role);
          const safeDefaultPage =
            DEFAULT_PAGE_BY_ROLE[normalizedUserRole] || "dashboard";

          const safeUser = {
            ...parsedUser,
            role: normalizedUserRole,
          };

          setUser(safeUser);
          setIsLoggedIn(true);

          if (
            savedActivePage &&
            typeof savedActivePage === "string" &&
            PAGE_ACCESS[savedActivePage]?.includes(normalizedUserRole)
          ) {
            setActivePage(savedActivePage);
          } else {
            setActivePage(safeDefaultPage);
            localStorage.setItem("crms_active_page", safeDefaultPage);
          }
        }
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("crms_token");
        localStorage.removeItem("crms_user");
        localStorage.removeItem("crms_role");
        localStorage.removeItem("crms_active_page");
        localStorage.removeItem("companyId");
        localStorage.removeItem("clientId");
      }
    }
  }, []);

  const currentRole = user?.role || null;

  const allowedPages = useMemo(() => {
    if (!currentRole) return [];

    return Object.keys(PAGE_ACCESS).filter((page) =>
      PAGE_ACCESS[page].includes(currentRole),
    );
  }, [currentRole]);

  const safeSetActivePage = (page) => {
    if (!currentRole) return;

    if (typeof page !== "string") {
      console.error("Invalid page value:", page);
      return;
    }

    if (PAGE_ACCESS[page]?.includes(currentRole)) {
      setActivePage(page);
      localStorage.setItem("crms_active_page", page);
      setShowNotifications(false);
      return;
    }

    const fallbackPage = DEFAULT_PAGE_BY_ROLE[currentRole] || "dashboard";
    setActivePage(fallbackPage);
    localStorage.setItem("crms_active_page", fallbackPage);
    setShowNotifications(false);
  };

  useEffect(() => {
    if (!currentRole) return;

    const isCurrentPageAllowed =
      typeof activePage === "string" &&
      PAGE_ACCESS[activePage]?.includes(currentRole);

    if (!isCurrentPageAllowed) {
      const fallbackPage = DEFAULT_PAGE_BY_ROLE[currentRole] || "dashboard";
      setActivePage(fallbackPage);
      localStorage.setItem("crms_active_page", fallbackPage);
    }
  }, [activePage, currentRole]);

  const handleLogout = () => {
    localStorage.removeItem("crms_token");
    localStorage.removeItem("crms_user");
    localStorage.removeItem("crms_role");
    localStorage.removeItem("companyId");
    localStorage.removeItem("clientId");
    localStorage.removeItem("crms_active_page");
    localStorage.removeItem("crms_sidebar_mode");

    setUser(null);
    setIsLoggedIn(false);
    setActivePage("dashboard");
    setShowNotifications(false);
  };

  const handleLoginSuccess = (loginResponse) => {
    const normalizedUserRole = normalizeRole(loginResponse.role);

    const loggedInUser = {
      id: loginResponse.id,
      name: loginResponse.name,
      fullName: loginResponse.fullName || loginResponse.name,
      email: loginResponse.email,
      role: normalizedUserRole,
      token: loginResponse.token,
    };

    localStorage.setItem("crms_token", loginResponse.token);
    localStorage.setItem("crms_role", normalizedUserRole);
    localStorage.setItem("crms_user", JSON.stringify(loggedInUser));

    if (normalizedUserRole === ROLE.COMPANY && loginResponse.id) {
      localStorage.setItem("companyId", loginResponse.id);
    }

    if (normalizedUserRole === ROLE.CLIENT && loginResponse.id) {
      localStorage.setItem("clientId", loginResponse.id);
    }

    const defaultPage = DEFAULT_PAGE_BY_ROLE[normalizedUserRole] || "dashboard";
    localStorage.setItem("crms_active_page", defaultPage);

    setUser(loggedInUser);
    setIsLoggedIn(true);
    setActivePage(defaultPage);
    setShowNotifications(false);
  };

  const handleToggleSidebarMode = () => {
    const nextMode = sidebarMode === "expanded" ? "collapsed" : "expanded";
    setSidebarMode(nextMode);
    localStorage.setItem("crms_sidebar_mode", nextMode);
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard user={user} role={currentRole} />;
      case "projects":
        return <Projects user={user} role={currentRole} />;
      case "documents":
        return <Documents user={user} role={currentRole} />;
      case "change-requests":
        return <ChangeRequests user={user} role={currentRole} />;
      case "proposals":
        return <Proposals user={user} role={currentRole} />;
      case "kanban":
        return <Kanban user={user} role={currentRole} />;
      case "notifications":
        return <Notifications user={user} role={currentRole} />;
      case "settings":
        return <Settings user={user} role={currentRole} />;
      default:
        return <Dashboard user={user} role={currentRole} />;
    }
  };

  const getPageInfo = () => {
    if (!currentRole) {
      return {
        title: "Dashboard",
        subtitle: "",
      };
    }

    return (
      PAGE_INFO[currentRole]?.[activePage] || {
        title: "Dashboard",
        subtitle: "",
      }
    );
  };

  if (!isLoggedIn) {
    return <Auth onLogin={handleLoginSuccess} />;
  }

  const pageInfo = getPageInfo();

  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-purple-300/30 blur-3xl" />
        <div className="absolute right-10 top-10 h-80 w-80 rounded-full bg-indigo-300/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
      </div>

      <Sidebar
        activePage={activePage}
        onNavigate={safeSetActivePage}
        mode={sidebarMode}
        onToggleMode={handleToggleSidebarMode}
        onLogout={handleLogout}
        user={user}
        role={currentRole}
        allowedPages={allowedPages}
      />

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="border-b border-white/60 bg-white/80 shadow-sm backdrop-blur-xl">
          <Header
            title={pageInfo.title}
            subtitle={pageInfo.subtitle}
            showNotifications={showNotifications}
            onToggleNotifications={() =>
              setShowNotifications((previous) => !previous)
            }
            onNavigateSettings={() => safeSetActivePage("settings")}
            onLogout={handleLogout}
            user={user}
            role={currentRole}
          />
        </div>

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-6 rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-lg shadow-slate-200/60 backdrop-blur-xl sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="mb-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-indigo-700">
                    {currentRole === ROLE.COMPANY
                      ? "Company Portal"
                      : "Client Portal"}
                  </p>
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                    {pageInfo.title}
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500 sm:text-base">
                    {pageInfo.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-sm font-black text-white shadow-lg shadow-indigo-200">
                    {user?.name?.charAt(0)?.toUpperCase() ||
                      user?.fullName?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">
                      {user?.fullName || user?.name || "User"}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      {currentRole}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/70 bg-white/55 p-4 shadow-xl shadow-slate-200/70 backdrop-blur-xl sm:p-5 lg:p-6">
              {renderPage()}
            </div>
          </div>
        </main>

        {showNotifications && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]"
              onClick={() => setShowNotifications(false)}
            />

            <div className="absolute right-4 top-24 z-50 flex w-[calc(100%-2rem)] max-w-md flex-col gap-3 sm:right-8">
              {currentRole === ROLE.CLIENT ? (
                <>
                  <NotificationCard
                    title="Proposal Received"
                    message="A new project proposal has been sent by the company for your review."
                    time="10 minutes ago"
                    isNew
                  />
                  <NotificationCard
                    title="PRD Uploaded"
                    message="A PRD document is now available for one of your projects."
                    time="2 hours ago"
                  />
                </>
              ) : (
                <>
                  <NotificationCard
                    title="Proposal Accepted"
                    message="A client has accepted your proposal. You can now proceed with the PRD."
                    time="30 minutes ago"
                    isNew
                  />
                  <NotificationCard
                    title="New Change Request"
                    message="A client has submitted a new change request for review."
                    time="3 hours ago"
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const NotificationCard = ({ title, message, time, isNew }) => (
  <div className="rounded-2xl border border-white/70 bg-white/95 p-4 shadow-2xl shadow-slate-300/50 backdrop-blur-xl">
    <div className="mb-2 flex items-start justify-between gap-3">
      <h4 className="text-sm font-extrabold text-slate-900">{title}</h4>

      {isNew && (
        <span className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
          New
        </span>
      )}
    </div>

    <p className="mb-3 text-xs font-medium leading-relaxed text-slate-600">
      {message}
    </p>

    <div className="flex items-center text-[11px] font-bold text-slate-400">
      <svg
        className="mr-1.5 h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {time}
    </div>
  </div>
);

export default App;