import { NextRequest, NextResponse } from "next/server";

import { cors, optionsResponse } from "@/lib/cors";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { setUserAuthCookie } from "@/lib/auth-cookie";
import { verifyGoogleCredential } from "@/lib/google-auth";
import { AuthService } from "@/services/auth.service";
import { registerDeviceSession } from "@/services/device-security.service";

const authService = new AuthService();

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!(await verifyTurnstileToken(body.turnstileToken, request))) {
      return cors(NextResponse.json({ success: false, message: "Cloudflare security verification failed" }, { status: 400 }));
    }
    const identity = await verifyGoogleCredential(body.credential);
    const result = await authService.googleUserLogin(identity);
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
      isNewUser: result.isNewUser,
    });
    setUserAuthCookie(response, result.token);
    return cors(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Google user login failed";
    return cors(NextResponse.json({ success: false, message }, { status: 401 }));
  }
}
