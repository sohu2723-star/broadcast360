import { NextRequest, NextResponse } from "next/server";

import { verifyUserToken } from "@/lib/user-jwt";
import { verifyTurnstileToken } from "@/lib/turnstile";

import { AuthService } from "@/services/auth.service";

import { cors, optionsResponse } from "@/lib/cors";

const authService = new AuthService();

export async function OPTIONS() {
  return optionsResponse();
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("user_token")?.value;

    if (!token) {
      return cors(
        NextResponse.json(
          {
            message: "Unauthorized",
          },
          {
            status: 401,
          },
        ),
      );
    }

    const payload = await verifyUserToken(token);

        const body = await request.json();

    if (body.acceptedPolicy !== true) {
      return cors(NextResponse.json({ message: "You must accept the FlickScope policy" }, { status: 400 }));
    }
    if (!(await verifyTurnstileToken(body.turnstileToken, request))) {
      return cors(NextResponse.json({ message: "Cloudflare security verification failed" }, { status: 400 }));
    }

    const user = await authService.updateProfile(Number(payload.id), {
      name: typeof body.name === "string" ? body.name.trim() : undefined,
      email: body.email,
      phone: body.phone,
      avatar: body.avatar,
    });
    console.log("PROFILE UPDATE BODY:", user);

    return cors(
      NextResponse.json({
        success: true,

        user,
      }),
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";

    return cors(
      NextResponse.json(
        {
          message,
        },
        {
          status: 500,
        },
      ),
    );
  }
}
