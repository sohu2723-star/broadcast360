import { NextRequest, NextResponse } from "next/server";

import { cors, optionsResponse } from "@/lib/cors";
import { setAuthCookie } from "@/lib/auth-cookie";
import { verifyGoogleCredential } from "@/lib/google-auth";
import { AuthService } from "@/services/auth.service";

const authService = new AuthService();

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identity = await verifyGoogleCredential(body.credential);
    const result = await authService.googleAdminLogin(identity);
    const response = NextResponse.json({ success: true, user: result.user });
    setAuthCookie(response, result.token);
    return cors(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Google admin login failed";
    return cors(NextResponse.json({ success: false, message }, { status: 401 }));
  }
}
