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

    const result = await authService.userLogin(body.email, body.password);

    const response = NextResponse.json({
      success: true,
      user: result.user,
    });

    response.cookies.set("user_token", result.token, {
      httpOnly: true,

      secure: false,

      sameSite: "lax",

      maxAge: 60 * 60 * 24 * 7,

      path: "/",
    });

    console.log("USER COOKIE CREATED");

    return cors(response);
  } catch (error) {
    return cors(
      NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Login failed",
        },
        {
          status: 401,
        },
      ),
    );
  }
}
