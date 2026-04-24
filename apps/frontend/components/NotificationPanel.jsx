"use client";

import React from "react";
import { getNotificationMeta } from "./notificationMeta";

const NotificationPanel = ({
  isOpen,
  notifications,
  onClose,
  onNotificationClick,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl"
          >
            x
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification) => {
              const meta = getNotificationMeta(notification.type);
              const Icon = meta.Icon;

              return (
                <button
                  key={notification.id}
                  onClick={() => onNotificationClick(notification)}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    notification.read
                      ? "bg-gray-50 border-gray-100"
                      : meta.panelClass
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${meta.iconClass}`} />

                      <div>
                        <p className="font-bold text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-1">
                          {meta.label}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {notification.createdAt
                            ? new Date(notification.createdAt).toLocaleString()
                            : "-"}
                        </p>
                      </div>
                    </div>

                    {!notification.read && (
                      <span
                        className={`w-3 h-3 rounded-full mt-1 ${meta.unreadDotClass}`}
                      />
                    )}
                  </div>
                </button>
              );
            })
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
