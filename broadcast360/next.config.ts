import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/streams/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "http://localhost:3001",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, OPTIONS, POST, PUT, DELETE",
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
