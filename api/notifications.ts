import { apiRequest } from "./http";

export function fetchNotifications(token: string) {
  return apiRequest("/api/notifications", {
    token,
    headers: { Accept: "application/json" },
  });
}
