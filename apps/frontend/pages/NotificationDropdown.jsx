"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, X } from "lucide-react";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Please change theme color -001 A",
      sender: "Amanda",
      time: "2 min ago",
      read: false,
    },
    {
      id: 2,
      message: "Final product received -002B",
      sender: "Louis",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      message: "New project assigned to you",
      sender: "System",
      time: "3 hours ago",
      read: true,
    },
  ]);

  const dropdownRef = useRef(null);

  useEffect(() => {
    // no-op: settings removed
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          // settings removed
        }}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px] text-slate-700" strokeWidth={2.2} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-semibold leading-none text-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-[var(--surface)] rounded-xl shadow-2xl border border-[var(--border-soft)] z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface-muted)] border-b border-[var(--border-soft)]">
            <h3 className="font-semibold text-gray-800">Notifications</h3>

            <div className="flex items-center gap-2">
              
              <button
                onClick={() => {
                  setIsOpen(false);
                }}
                className="p-1 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {/* settings removed */}

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`group p-4 border-b border-gray-100 cursor-pointer hover:bg-[var(--surface-muted)] transition-colors ${
                    !notification.read ? "bg-[var(--primary-100)]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        !notification.read
                          ? "bg-[var(--accent-purple)]"
                          : "bg-gray-300"
                      }`}
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 font-medium leading-relaxed">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          -{notification.sender}
                        </span>
                        <span className="text-xs text-gray-400">
                          {notification.time}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => removeNotification(notification.id, e)}
                      className="p-1 hover:bg-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 bg-[var(--surface-muted)] border-t border-[var(--border-soft)] flex items-center justify-between">
              <button
                onClick={markAllAsRead}
                className="text-sm text-[var(--accent-purple)] hover:text-[var(--primary-600)] font-medium"
              >
                Mark all as read
              </button>

              <button
                onClick={clearAllNotifications}
                className="text-sm text-[var(--accent-purple)] hover:text-[var(--primary-600)] font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;