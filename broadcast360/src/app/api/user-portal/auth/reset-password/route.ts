import { NextRequest, NextResponse } from "next/server";

import { cors, optionsResponse } from "@/lib/cors";
import { assertGmailAddress } from "@/lib/auth-policy";
import { createUserSchema } from "@/lib/validators/user.validator";
import { AuthService } from "@/services/auth.service";

const authService = new AuthService();

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = assertGmailAddress(body.email);
    const verificationCode = String(body.verificationCode ?? "").trim();
    const newPassword = String(body.newPassword ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");

    if (!/^\d{6}$/.test(verificationCode)) {
      throw new Error("Verification code must be 6 digits");
    }

    const passwordResult = createUserSchema.shape.password.safeParse(newPassword);
    if (!passwordResult.success) {
      throw new Error(passwordResult.error.issues[0]?.message ?? "Invalid password");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    await authService.resetUserPassword(email, verificationCode, newPassword);

    return cors(
      NextResponse.json({
        success: true,
        message: "Password reset successfully",
      }),
    );
  } catch (error: unknown) {
    return cors(
      NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Could not reset password",
        },
        { status: 400 },
      ),
    );
  }
}
