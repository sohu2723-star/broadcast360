import { NextRequest, NextResponse } from "next/server";

import { verifyUserToken } from "@/lib/user-jwt";

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

    const user = await authService.updateProfile(Number(payload.id), {
      name: body.name,
      email: body.email,
      phone: body.phone,
      avatar: body.avatar,
    });

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
