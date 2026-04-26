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
      title: "Project Clientside Kanban",
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
      title: "Project Company-side Kanban",
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
          const normalizedRole = normalizeRole(parsedUser.role);
          const safeDefaultPage =
            DEFAULT_PAGE_BY_ROLE[normalizedRole] || "dashboard";

          const safeUser = {
            ...parsedUser,
            role: normalizedRole,
          };

          setUser(safeUser);
          setIsLoggedIn(true);

          if (
            savedActivePage &&
            typeof savedActivePage === "string" &&
            PAGE_ACCESS[savedActivePage]?.includes(normalizedRole)
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
      PAGE_ACCESS[page].includes(currentRole)
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
    } else {
      const fallbackPage = DEFAULT_PAGE_BY_ROLE[currentRole] || "dashboard";
      setActivePage(fallbackPage);
      localStorage.setItem("crms_active_page", fallbackPage);
      setShowNotifications(false);
    }
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
    const normalizedRole = normalizeRole(loginResponse.role);

    const loggedInUser = {
      id: loginResponse.id,
      name: loginResponse.name,
      fullName: loginResponse.fullName || loginResponse.name,
      email: loginResponse.email,
      role: normalizedRole,
      token: loginResponse.token,
    };

    localStorage.setItem("crms_token", loginResponse.token);
    localStorage.setItem("crms_role", normalizedRole);
    localStorage.setItem("crms_user", JSON.stringify(loggedInUser));

    if (normalizedRole === ROLE.COMPANY && loginResponse.id) {
      localStorage.setItem("companyId", loginResponse.id);
    }

    if (normalizedRole === ROLE.CLIENT && loginResponse.id) {
      localStorage.setItem("clientId", loginResponse.id);
    }

    const defaultPage = DEFAULT_PAGE_BY_ROLE[normalizedRole] || "dashboard";
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

  if (!isLoggedIn) {
    return <Auth onLogin={handleLoginSuccess} />;
  }

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

  const pageInfo = getPageInfo();

  return (
    <div className="flex h-screen bg-[#f3f4f6] overflow-hidden">
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

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          showNotifications={showNotifications}
          onToggleNotifications={() => setShowNotifications(!showNotifications)}
          onNavigateSettings={() => safeSetActivePage("settings")}
          onLogout={handleLogout}
          user={user}
          role={currentRole}
        />

        <main className="flex-1 overflow-y-auto p-8">{renderPage()}</main>

        {showNotifications && (
          <>
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => setShowNotifications(false)}
            />
            <div className="absolute top-24 right-8 z-50 w-96 flex flex-col gap-3 pointer-events-auto">
              {currentRole === ROLE.CLIENT ? (
                <>
                  <NotificationCard
                    title="Proposal Received"
                    message="A new project proposal has been sent by the company for your review."
                    time="10 minutes ago"
                    isNew={true}
                  />
                  <NotificationCard
                    title="PRD Uploaded"
                    message="A PRD document is now available for one of your projects."
                    time="2 hours ago"
                    isNew={false}
                  />
                </>
              ) : (
                <>
                  <NotificationCard
                    title="Proposal Accepted"
                    message="A client has accepted your proposal. You can now proceed with the PRD."
                    time="30 minutes ago"
                    isNew={true}
                  />
                  <NotificationCard
                    title="New Change Request"
                    message="A client has submitted a new change request for review."
                    time="3 hours ago"
                    isNew={false}
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
  <div className="bg-white rounded-xl shadow-2xl p-4 border-l-4 border-purple-500 transform transition-all animate-in slide-in-from-top-4 duration-300">
    <div className="flex justify-between items-start mb-1">
      <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
      {isNew && (
        <span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          New
        </span>
      )}
    </div>
    <p className="text-gray-600 text-xs mb-2 leading-relaxed">{message}</p>
    <div className="flex items-center text-gray-400 text-[10px]">
      <svg
        className="w-3 h-3 mr-1"
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