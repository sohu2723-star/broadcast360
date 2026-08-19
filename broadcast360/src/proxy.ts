import { NextRequest, NextResponse } from "next/server";

import { verifyToken } from "@/lib/jwt";
import { verifyUserToken } from "@/lib/user-jwt";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    const allowedOrigin =
      process.env.USER_PORTAL_ORIGIN || "http://localhost:3001";

    if (origin === allowedOrigin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,DELETE,OPTIONS",
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
      );
    }

    return response;
  }

  if (pathname === "/") {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const payload = await verifyToken(token);
      if (payload.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/api/admin")) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Admin unauthorized" }, { status: 401 });
    }

    try {
      const payload = await verifyToken(token);
      if (payload.role !== "ADMIN") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json(
        { message: "Invalid admin token" },
        { status: 401 },
      );
    }
  }

  const publicUserRoutes = [
    "/api/user-portal/auth/login",
    "/api/user-portal/auth/register",
  ];

  const isUserPublicRoute = publicUserRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (pathname.startsWith("/api/user-portal") && !isUserPublicRoute) {
    const token = request.cookies.get("user_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "User unauthorized" }, { status: 401 });
    }

    try {
      const payload = await verifyUserToken(token);
      if (payload.role !== "USER") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json(
        { message: "Invalid user token" },
        { status: 401 },
      );
    }
  }

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const payload = await verifyToken(token);
      if (payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
