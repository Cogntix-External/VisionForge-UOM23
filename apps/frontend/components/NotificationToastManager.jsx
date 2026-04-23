"use client";

import React, { useEffect, useRef, useState } from "react";
import { getClientNotifications } from "../services/api";

const NotificationToastManager = () => {
  const [toast, setToast] = useState(null);
  const lastNotificationId = useRef(null);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const data = await getClientNotifications();
        const list = Array.isArray(data) ? data : [];

        const latestUnread = list.find((n) => !n.read);

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

  return (
    <div className="fixed top-6 right-6 z-[100] w-full max-w-sm">
      <div className="bg-white border border-purple-200 shadow-2xl rounded-xl p-4 animate-slideIn">
        <p className="font-bold text-gray-900">{toast.title}</p>

        <p className="text-sm text-gray-600 mt-1">{toast.message}</p>
      </div>
    </div>
  );
};

export default NotificationToastManager;
