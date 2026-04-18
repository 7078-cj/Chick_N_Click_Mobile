import { API_BASE_URL } from "@/api/config";

/**
 * Resolves stored proof / media paths to a full URL (http or API-prefixed /storage).
 */
export function resolveStorageOrRemoteUrl(
  value?: string | null,
  baseUrl: string = API_BASE_URL,
): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  const origin = baseUrl.replace(/\/$/, "");
  if (trimmed.startsWith("/storage/")) {
    return `${origin}${trimmed}`;
  }
  return `${origin}/storage/${trimmed.replace(/^\/+/, "")}`;
}
