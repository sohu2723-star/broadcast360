import { NextRequest, NextResponse } from "next/server";

import { verifyUserToken } from "@/lib/user-jwt";

import { AuthService } from "@/services/auth.service";

const authService = new AuthService();

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("user_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const payload = await verifyUserToken(token);

    const body = await request.json();

    await authService.changePassword(
      Number(payload.id),
      body.currentPassword,
      body.newPassword,
    );

    return NextResponse.json({
      success: true,

      message: "Password changed successfully",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Password change failed";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status: 400,
      },
    );
  }
}
