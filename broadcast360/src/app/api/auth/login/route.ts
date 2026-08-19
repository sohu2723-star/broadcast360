import { NextRequest, NextResponse } from "next/server";

import { AuthService } from "@/services/auth.service";
import { cors, optionsResponse } from "@/lib/cors";

const authService = new AuthService();

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await authService.login(body.email, body.password);

    const response = NextResponse.json({
      success: true,

      user: result.user,
    });

    response.cookies.set("token", result.token, {
      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      maxAge: 60 * 60 * 24 * 7,

      path: "/",
    });

    return cors(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";

    return cors(
      NextResponse.json(
        {
          success: false,
          message,
        },
        {
          status: 401,
        },
      ),
    );
  }
}
