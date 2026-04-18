import { API_BASE_URL } from "./config";

export function joinApiPath(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, "");
  const rel = path.startsWith("/") ? path : `/${path}`;
  return `${base}${rel}`;
}

export type ApiRequestInit = RequestInit & {
  token?: string | null;
};

/**
 * Central fetch: attaches Bearer token when provided and default Accept header.
 */
export function apiRequest(
  path: string,
  init: ApiRequestInit = {},
): Promise<Response> {
  const { token, headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders as HeadersInit | undefined);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(joinApiPath(path), { ...rest, headers });
}
