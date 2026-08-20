export interface Env {
  ADMIN: Fetcher;
  PORTAL: Fetcher;
}

function isAdminPath(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/api" ||
    pathname.startsWith("/api/")
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const upstream = isAdminPath(url.pathname) ? env.ADMIN : env.PORTAL;
    return upstream.fetch(request);
  },
};
