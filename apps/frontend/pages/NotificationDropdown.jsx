"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: 'Please change theme color -001 A',
      sender: 'Amanda',
      time: '2 min ago',
      read: false
    },
    {
      id: 2,
      message: 'final product received -002B',
      sender: 'Louis',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      message: 'New project assigned to you',
      sender: 'System',
      time: '3 hours ago',
      read: true
    }
  ]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const removeNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-[var(--surface-muted)] transition-colors"
      >
        <Bell className="w-6 h-6 text-[#636b7f]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold leading-none text-white shadow-sm ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <h3 className="font-semibold text-gray-800">Layer Notification</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Notifications List */}
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
                  className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                    !notification.read ? 'bg-indigo-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      !notification.read ? 'bg-[var(--accent-purple)]' : 'bg-gray-300'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 font-medium leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">-{notification.sender}</span>
                        <span className="text-xs text-gray-400">{notification.time}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => removeNotification(notification.id, e)}
                      className="rounded-full p-1 transition-colors hover:bg-slate-100"
                      aria-label="Remove notification"
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
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
              <button 
                onClick={() => setNotifications([])}
                className="text-sm font-medium text-red-600 hover:text-red-700"
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
