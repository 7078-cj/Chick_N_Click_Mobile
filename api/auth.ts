import { apiRequest } from "./http";

export async function loginRequest(email: string, password: string) {
  const res = await apiRequest("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  return res.json();
}

export async function registerRequest(body: Record<string, unknown>) {
  const res = await apiRequest("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown> & {
    message?: string;
  };
  return { res, data };
}
