import React, { useState } from "react";

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "CR_APPROVED",
    title: "Change Request Approved",
    message: "CR-001: JWT Authentication has been approved",
    timestamp: "2 hours ago",
    read: false,
    projectId: "PRD-001",
    severity: "success",
  },
  {
    id: "2",
    type: "CR_REJECTED",
    title: "Change Request Rejected",
    message: "CR-002: Database Schema Update needs revision",
    timestamp: "5 hours ago",
    read: false,
    projectId: "PRD-001",
    severity: "error",
  },
  {
    id: "3",
    type: "CR_SUBMITTED",
    title: "New Change Request",
    message: "CR-003: Frontend Dashboard UI submitted for review",
    timestamp: "1 day ago",
    read: true,
    projectId: "PRD-002",
    severity: "info",
  },
  {
    id: "4",
    type: "DEADLINE",
    title: "Approaching Deadline",
    message: "CR-001 timeline ending in 3 days",
    timestamp: "2 days ago",
    read: true,
    projectId: "PRD-001",
    severity: "warning",
  },
  {
    id: "5",
    type: "COMMENT",
    title: "New Comment",
    message: "John Doe commented on CR-002",
    timestamp: "3 days ago",
    read: true,
    projectId: "PRD-002",
    severity: "info",
  },
];

const NotificationDetailsModal = ({ notification, onClose, onMarkRead }) => {
  if (!notification) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-detail-title"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[90vw] lg:max-w-2xl max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 p-6 flex justify-between items-center">
          <div>
            <h2
              id="notif-detail-title"
              className="text-white font-bold text-2xl"
            >
              {notification.title}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {notification.timestamp}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                notification.severity === "success"
                  ? "bg-green-500"
                  : notification.severity === "error"
                    ? "bg-red-500"
                    : notification.severity === "warning"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
              }`}
            >
              {notification.type.replace("_", " ")}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                notification.read
                  ? "bg-gray-100 text-gray-600"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {notification.read ? "Read" : "Unread"}
            </span>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <p className="text-gray-900 text-lg font-semibold mb-2">
              {notification.message}
            </p>
            <p className="text-gray-600 text-sm">
              Project ID: {notification.projectId}
            </p>
          </div>
          <div className="flex gap-4">
            {!notification.read && (
              <button
                onClick={() => {
                  onMarkRead(notification.id);
                  onClose();
                }}
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
              >
                ✓ Mark as Read
              </button>
            )}
            <button
              onClick={onClose}
              className={`flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filter, setFilter] = useState("All");

  const handleMarkRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const filteredNotifications =
    filter === "All"
      ? notifications
      : filter === "Unread"
        ? notifications.filter((n) => !n.read)
        : filter === "Read"
          ? notifications.filter((n) => n.read)
          : notifications;

  const downloadNotifications = () => {
    const content = `NOTIFICATIONS EXPORT\nTotal: ${notifications.length}\n\n${notifications.map((n) => `[${n.severity.toUpperCase()}] ${n.title}\n${n.message}\nTime: ${n.timestamp}\nStatus: ${n.read ? "Read" : "Unread"}\n`).join("\n---\n")}`;
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`,
    );
    element.setAttribute("download", "notifications-export.txt");
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 px-4">
        <h2 className="text-3xl font-black text-gray-900">Notifications</h2>
        <div className="flex gap-2">
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-sm"
            aria-label="Mark all as read"
          >
            ✓ Mark All
          </button>
          <button
            onClick={downloadNotifications}
            className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition text-sm"
            aria-label="Download notifications"
          >
            ⬇️ Export
          </button>
        </div>
      </div>

      <div className="px-4 mb-6 flex gap-2 flex-wrap">
        {["All", "Unread", "Read"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            aria-pressed={filter === f}
          >
            {f} (
            {
              notifications.filter((n) =>
                f === "All" ? true : f === "Unread" ? !n.read : n.read,
              ).length
            }
            )
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {filteredNotifications.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-gray-600 font-semibold">No notifications</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => setSelectedNotification(notif)}
                className={`p-4 rounded-xl border-l-4 cursor-pointer transition-all hover:shadow-md ${
                  notif.severity === "success"
                    ? "bg-green-50 border-green-400"
                    : notif.severity === "error"
                      ? "bg-red-50 border-red-400"
                      : notif.severity === "warning"
                        ? "bg-yellow-50 border-yellow-400"
                        : "bg-blue-50 border-blue-400"
                } ${!notif.read ? "shadow-md ring-1 ring-opacity-50 ring-blue-300" : "bg-gray-50 border-gray-300"}`}
                role="button"
                tabIndex={0}
                aria-label={`${notif.title}: ${notif.message}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">{notif.title}</h3>
                      {!notif.read && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm mb-2">
                      {notif.message}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {notif.timestamp} • {notif.projectId}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notif.id);
                    }}
                    className="text-gray-400 hover:text-red-600 ml-4 flex-shrink-0"
                    aria-label={`Delete notification: ${notif.title}`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedNotification && (
        <NotificationDetailsModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onMarkRead={handleMarkRead}
        />
      )}
    </div>
  );
};

export default Notifications;
