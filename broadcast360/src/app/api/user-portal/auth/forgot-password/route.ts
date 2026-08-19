import { NextRequest, NextResponse } from "next/server";

import { cors, optionsResponse } from "@/lib/cors";
import { assertGmailAddress } from "@/lib/auth-policy";
import { sendVerificationCode } from "@/services/email-verification.service";
import { UserRepository } from "@/repositories/user.repository";

const userRepository = new UserRepository();

const GENERIC_MESSAGE =
  "If this Gmail account exists, a password reset code has been sent.";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = assertGmailAddress(body.email);
    const existing = await userRepository.findByEmail(email);

    if (existing && existing.role !== "ADMIN") {
      await sendVerificationCode(email, "PASSWORD_RESET");
    }

    return cors(
      NextResponse.json({
        success: true,
        message: GENERIC_MESSAGE,
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
              : "Could not send password reset code",
        },
        { status: 400 },
      ),
    );
  }
}
