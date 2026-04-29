"use client";

import React from "react";
import { X, Bell } from "lucide-react";
import { getNotificationMeta } from "./notificationMeta";

const NotificationPanel = ({
  isOpen,
  notifications = [],
  onClose,
  onNotificationClick,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/70">
                Activity Center
              </p>
              <h2 className="mt-1 text-2xl font-black">Notifications</h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-white/15 p-2 transition hover:bg-white/25"
              aria-label="Close notifications"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => {
              const meta = getNotificationMeta(notification.type);
              const Icon = meta.Icon;

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => onNotificationClick(notification)}
                  className={`w-full rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    notification.read
                      ? "border-slate-100 bg-white"
                      : meta.panelClass
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <Icon className={`h-5 w-5 ${meta.iconClass}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-black text-slate-900">
                          {notification.title || "Notification"}
                        </p>

                        {!notification.read && (
                          <span
                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${meta.unreadDotClass}`}
                          />
                        )}
                      </div>

                      <p className="mt-1 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                        {meta.label}
                      </p>

                      <p className="mt-2 line-clamp-3 text-sm font-medium leading-relaxed text-slate-600">
                        {notification.message || "-"}
                      </p>

                      <p className="mt-3 text-xs font-semibold text-slate-400">
                        {notification.createdAt
                          ? new Date(notification.createdAt).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm">
                <Bell className="h-7 w-7" />
              </div>
              <p className="text-lg font-black text-slate-700">
                No notifications
              </p>
              <p className="mt-1 text-sm font-medium text-slate-400">
                New updates will appear here.
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default NotificationPanel;