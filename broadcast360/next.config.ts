import type { NextConfig } from "next";

const userPortalOrigin = process.env.USER_PORTAL_ORIGIN || "http://localhost:3001";
const streamOrigin = process.env.PUBLIC_STREAM_ORIGIN || "*";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/streams/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: streamOrigin,
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: userPortalOrigin,
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, OPTIONS, POST, PUT, PATCH, DELETE",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "Content-Type, Authorization, X-Requested-With, cache-control, pragma",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
