import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Documents from "./pages/Documents";
import ChangeRequests from "./pages/ChangeRequests";
import Kanban from "./pages/Kanban";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  // 'expanded' = with nav (text), 'collapsed' = without nav (icons only)
  const [sidebarMode, setSidebarMode] = useState("collapsed");

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActivePage("dashboard");
  };

  if (!isLoggedIn) {
    return (
      <Auth
        onLogin={(loggedInUser) => {
          setUser(loggedInUser);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "projects":
        return <Projects />;
      case "documents":
        return <Documents />;
      case "change-requests":
        return <ChangeRequests />;
      case "kanban":
        return <Kanban />;
      case "notifications":
        return <Notifications />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const getPageInfo = () => {
    switch (activePage) {
      case "dashboard":
        return {
          title: "Dashboard",
          subtitle:
            "Welcome back! Here is what is happening with your projects.",
        };
      case "projects":
        return {
          title: "My projects",
          subtitle: "View and manage all your projects in one place",
        };
      case "documents":
        return {
          title: "Documents",
          subtitle:
            "Access all project documents, PRDs, and change request files.",
        };
      case "change-requests":
        return {
          title: "Change Requests",
          subtitle: "Manage your requirements and track modifications.",
        };
      case "kanban":
        return {
          title: "Kanban",
          subtitle: "Visual progress of your change requests and tasks.",
        };
      case "notifications":
        return {
          title: "Notifications",
          subtitle: "View and manage all your notifications",
        };
      case "settings":
        return {
          title: "Settings",
          subtitle: "Manage your account settings and preferences",
        };
      default:
        return { title: "Dashboard", subtitle: "" };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="flex h-screen bg-[#f3f4f6] overflow-hidden">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        mode={sidebarMode}
        onToggleMode={() =>
          setSidebarMode(sidebarMode === "expanded" ? "collapsed" : "expanded")
        }
        onLogout={handleLogout}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          showNotifications={showNotifications}
          onToggleNotifications={() => setShowNotifications(!showNotifications)}
          onNavigateSettings={() => setActivePage("settings")}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-8">{renderPage()}</main>

        {showNotifications && (
          <>
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => setShowNotifications(false)}
            />
            <div className="absolute top-24 right-8 z-50 w-96 flex flex-col gap-3 pointer-events-auto">
              <NotificationCard
                title="Change Request Approved"
                message="Your change request CR-2025-001 has been approved."
                time="2 hours ago"
                isNew={true}
              />
              <NotificationCard
                title="New Document Uploaded"
                message="PRD v3.0 for NexaFlow is now available for review."
                time="5 hours ago"
                isNew={false}
              />
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
