const defaultApiOrigin = "http://localhost:3000";

export const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || defaultApiOrigin
).replace(/\/$/, "");

export function apiUrl(path: string) {
  return `${API_ORIGIN}/${path.replace(/^\//, "")}`;
}

export function mediaUrl(path: string | null | undefined) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return apiUrl(path);
}
