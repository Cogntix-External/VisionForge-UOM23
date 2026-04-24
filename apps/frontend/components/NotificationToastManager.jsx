"use client";

import React, { useEffect, useRef, useState } from "react";
import { getNotifications } from "../services/api";
import { getNotificationMeta } from "./notificationMeta";

const NotificationToastManager = () => {
  const [toast, setToast] = useState(null);
  const lastNotificationId = useRef(null);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const data = await getNotifications();
        const list = Array.isArray(data) ? data : [];

        const latestUnread = list.find((notification) => !notification.read);

        if (latestUnread && latestUnread.id !== lastNotificationId.current) {
          lastNotificationId.current = latestUnread.id;

          setToast(latestUnread);

          setTimeout(() => {
            setToast(null);
          }, 4000);
        }
      } catch (err) {
        console.error("Notification polling error:", err);
      }
    };

    checkNotifications();

    const interval = setInterval(checkNotifications, 15000);

    return () => clearInterval(interval);
  }, []);

  if (!toast) return null;

  const meta = getNotificationMeta(toast.type);
  const Icon = meta.Icon;

  return (
    <div className="fixed top-6 right-6 z-[100] w-full max-w-sm">
      <div
        className={`bg-white border shadow-2xl rounded-xl p-4 animate-slideIn ${meta.toastClass}`}
      >
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 mt-0.5 ${meta.iconClass}`} />
          <div>
            <p className="font-bold text-gray-900">{toast.title}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-1">
              {meta.label}
            </p>
            <p className="text-sm text-gray-600 mt-2">{toast.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToastManager;
