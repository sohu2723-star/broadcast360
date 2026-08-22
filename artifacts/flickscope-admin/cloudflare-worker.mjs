/**
 * The gateway forwards admin traffic with its `/admin` prefix intact.
 * Cloudflare Assets are stored without that prefix, so normalize the
 * pathname before asking the asset binding to serve the request.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/admin" || url.pathname === "/admin/") {
      url.pathname = "/index.html";
    } else if (url.pathname.startsWith("/admin/")) {
      url.pathname = url.pathname.slice("/admin".length) || "/";
    }

    return env.ASSETS.fetch(new Request(url, request));
  },
};