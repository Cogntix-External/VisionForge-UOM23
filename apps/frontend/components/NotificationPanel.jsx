"use client";

import React from "react";

const NotificationPanel = ({
  isOpen,
  notifications,
  onClose,
  onNotificationClick,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => onNotificationClick(n)}
                className={`w-full text-left p-4 rounded-xl border transition ${
                  n.read
                    ? "bg-gray-50 border-gray-100"
                    : "bg-purple-50 border-purple-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">{n.title}</p>

                    <p className="text-sm text-gray-600 mt-1">{n.message}</p>

                    <p className="text-xs text-gray-400 mt-2">
                      {n.createdAt
                        ? new Date(n.createdAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>

                  {!n.read && (
                    <span className="w-3 h-3 bg-purple-500 rounded-full mt-1" />
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="text-center text-gray-400 py-10 font-semibold">
              No notifications
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
