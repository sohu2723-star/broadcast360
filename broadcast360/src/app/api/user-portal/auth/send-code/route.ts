import { NextRequest, NextResponse } from "next/server";

import { cors, optionsResponse } from "@/lib/cors";
import { assertGmailAddress } from "@/lib/auth-policy";
import { sendVerificationCode } from "@/services/email-verification.service";
import { UserRepository } from "@/repositories/user.repository";

const userRepository = new UserRepository();

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = assertGmailAddress(body.email);
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      return cors(
        NextResponse.json(
          { success: false, message: "Email already exists" },
          { status: 409 },
        ),
      );
    }

    const result = await sendVerificationCode(email, "REGISTER");
    return cors(
      NextResponse.json({
        success: true,
        message: "Verification code sent",
        expiresAt: result.expiresAt.toISOString(),
      }),
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not send verification code";
    return cors(NextResponse.json({ success: false, message }, { status: 400 }));
  }
}
