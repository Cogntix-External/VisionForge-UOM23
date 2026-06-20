// ─────────────────────────────────────────────────────────
// notificationService.js  —  Notification API calls
// ─────────────────────────────────────────────────────────

import { request } from "./http.js";

export function getNotifications() {
  return request("/notifications", { method: "GET" });
}

export function getUnreadNotificationCount() {
  return request("/notifications/unread-count", { method: "GET" });
}

export function markNotificationAsRead(notificationId) {
  return request(`/notifications/${notificationId}/read`, { method: "PATCH" });
}

// Aliases for client-side usage
export const getClientNotifications = getNotifications;
export const getClientUnreadNotificationCount = getUnreadNotificationCount;
