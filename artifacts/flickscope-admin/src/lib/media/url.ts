export function resolveMediaUrl(path: string | null | undefined, origin: string) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${origin.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
