const allowedOrigins = new Set(
  [
    "http://localhost:3001",
    "https://hxu-movie-portal.workers.dev",
    "https://hxu-movie.workers.dev",
    process.env.NEXT_PUBLIC_USER_PORTAL_URL,
    process.env.USER_PORTAL_URL,
  ].filter((value): value is string => Boolean(value)),
);

export function getPortalCorsHeaders(request?: Request) {
  const requestOrigin = request?.headers.get("origin");
  const allowOrigin = requestOrigin && allowedOrigins.has(requestOrigin)
    ? requestOrigin
    : "https://hxu-movie.workers.dev";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}
