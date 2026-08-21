import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

initOpenNextCloudflareForDev();

const userPortalOrigin = process.env.USER_PORTAL_ORIGIN || "http://localhost:3001";
const streamOrigin = process.env.PUBLIC_STREAM_ORIGIN || "*";

const nextConfig: NextConfig = {
  assetPrefix: "/admin",
  serverExternalPackages: [
    "jose",
  ],
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
