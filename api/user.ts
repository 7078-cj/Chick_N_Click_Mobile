import { apiRequest } from "./http";

export function getCurrentUser(token: string) {
  return apiRequest("/api/user", {
    token,
    headers: { Accept: "application/json" },
  });
}

export function updateUser(token: string, payload: Record<string, unknown>) {
  return apiRequest("/api/user/update", {
    method: "PUT",
    token,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
}
