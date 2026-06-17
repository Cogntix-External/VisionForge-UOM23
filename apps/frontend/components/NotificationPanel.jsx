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
        className="fixed inset-0 z-40 bg-transparent"
        onClick={onClose}
      />

      <aside className="absolute right-6 top-16 z-50 w-80 overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:text-white dark:ring-white/6">
        <div className="bg-slate-50 px-5 py-4 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="mt-1 text-lg font-black">Notifications</h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-white/6 p-2 transition hover:bg-white/12"
              aria-label="Close notifications"
            >
              <X className="h-4 w-4 text-white/90" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="scrollbar-dark max-h-60 space-y-3 overflow-y-auto bg-white p-4 dark:bg-slate-900/90">
          {notifications.length > 0 ? (
            notifications.map((notification) => {
              const meta = getNotificationMeta(notification.type);
              const Icon = meta.Icon;
              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => onNotificationClick(notification)}
                  className={`flex w-full items-start gap-3 rounded-xl border border-slate-200 px-3 py-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 ${
                    notification.read ? "opacity-80" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-white/6">
                    <Icon className={`h-5 w-5 ${meta.iconClass}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black truncate">
                        {notification.title || "Notification"}
                      </p>

                      {!notification.read && (
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.unreadDotClass}`}
                        />
                      )}
                    </div>

                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      {meta.label}
                    </p>

                    <p className="mt-2 text-sm leading-relaxed text-slate-300 truncate">
                      {notification.message || "-"}
                    </p>

                    <p className="mt-2 text-xs font-medium text-slate-500">
                      {notification.createdAt
                        ? new Date(notification.createdAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="flex h-40 flex-col items-center justify-center px-4 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-white/6 dark:text-slate-300">
                <Bell className="h-6 w-6" />
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-white/90">No notifications</p>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">New updates will appear here.</p>
            </div>
          )}
          </div>

          {/* subtle fade to indicate more content when scrolled */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent dark:from-slate-900/90" />
        </div>
      </aside>
    </>
  );
};

export default NotificationPanel;