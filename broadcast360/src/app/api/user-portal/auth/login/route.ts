import { NextRequest, NextResponse } from "next/server";

import { AuthService } from "@/services/auth.service";

import { cors, optionsResponse } from "@/lib/cors";
import { setUserAuthCookie } from "@/lib/auth-cookie";

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

    setUserAuthCookie(response, result.token);

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
