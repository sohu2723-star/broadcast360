import { NextRequest, NextResponse } from "next/server";

import { verifyToken } from "@/lib/jwt";

import { AuthService } from "@/services/auth.service";

const authService = new AuthService();

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

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

    const payload = await verifyToken(token);

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
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 400,
      },
    );
  }
}
