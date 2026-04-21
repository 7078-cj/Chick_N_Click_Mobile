import { apiRequest } from "./http";

/**
 * Get all notifications
 */
export function fetchNotifications(token: string) {
  return apiRequest("/api/notifications", {
    token,
    headers: { Accept: "application/json" },
  });
}

/**
 * Mark a notification as READ
 */
export function markNotificationAsRead(token: string, notificationId: number) {
  return apiRequest(`/api/notifications/${notificationId}/read`, {
    method: "PUT",
    token,
    headers: { Accept: "application/json" },
  });
}

/**
 * Delete a notification
 */
export function deleteNotification(token: string, notificationId: number) {
  return apiRequest(`/api/notifications/${notificationId}`, {
    method: "DELETE",
    token,
    headers: { Accept: "application/json" },
  });
}