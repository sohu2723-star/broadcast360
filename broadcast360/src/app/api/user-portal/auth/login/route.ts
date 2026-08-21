import { NextRequest, NextResponse } from "next/server";

import { AuthService } from "@/services/auth.service";
import { verifyTurnstileToken } from "@/lib/turnstile";

import { cors, optionsResponse } from "@/lib/cors";
import { setUserAuthCookie } from "@/lib/auth-cookie";
import { registerDeviceSession } from "@/services/device-security.service";

const authService = new AuthService();

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!(await verifyTurnstileToken(body.turnstileToken, request))) {
      return cors(
        NextResponse.json(
          { success: false, message: "Cloudflare security verification failed" },
          { status: 400 },
        ),
      );
    }

    const result = await authService.userLogin(body.email, body.password);
    if (typeof body.deviceId === "string" && body.deviceId.trim()) {
      try {
        await registerDeviceSession(result.user.id, request, body.deviceId);
      } catch (sessionError) {
        console.error("DEVICE SESSION RECORDING FAILED:", sessionError);
      }
    }

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
