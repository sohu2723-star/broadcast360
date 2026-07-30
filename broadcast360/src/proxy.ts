import { NextRequest, NextResponse } from "next/server";

import { verifyToken } from "@/lib/jwt";
import { verifyUserToken } from "@/lib/user-jwt";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  /*
  =====================
        CORS
  =====================
  */

  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, {
      status: 204,
    });

    if (origin === "http://localhost:3001") {
      response.headers.set("Access-Control-Allow-Origin", origin);

      response.headers.set("Access-Control-Allow-Credentials", "true");

      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,DELETE,OPTIONS",
      );

      response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    }

    return response;
  }

  /*
=====================
       ROOT BLOCK
=====================
*/

if (pathname === "/") {

  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  try {

    const payload = await verifyToken(token);

    if (payload.role === "ADMIN") {
      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }

  } catch {

    return NextResponse.redirect(
      new URL("/login", request.url)
    );

  }
}


  /*
  =====================
        ADMIN API
  =====================
  */

  if (pathname.startsWith("/api/admin")) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Admin unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    try {
      const payload = await verifyToken(token);

      if (payload.role !== "ADMIN") {
        return NextResponse.json(
          {
            message: "Forbidden",
          },
          {
            status: 403,
          },
        );
      }
    } catch {
      return NextResponse.json(
        {
          message: "Invalid admin token",
        },
        {
          status: 401,
        },
      );
    }
  }

  /*
  =====================
      USER PORTAL API
  =====================
  */

  if (pathname.startsWith("/api/user-portal")) {
    const token = request.cookies.get("user_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "User unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    try {
      const payload = await verifyUserToken(token);

      if (payload.role !== "USER") {
        return NextResponse.json(
          {
            message: "Forbidden",
          },
          {
            status: 403,
          },
        );
      }
    } catch {
      return NextResponse.json(
        {
          message: "Invalid user token",
        },
        {
          status: 401,
        },
      );
    }
  }

  /*
  =====================
       ADMIN PAGE
  =====================
  */

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
  matcher: [
    "/admin/:path*",
    "/api/user-portal/profile",
    "/api/user-portal/change-password",
  ],
};


