import { NextRequest, NextResponse } from "next/server";

import { cors, optionsResponse } from "@/lib/cors";
import { assertGmailAddress } from "@/lib/auth-policy";
import { verifyVerificationCode } from "@/services/email-verification.service";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = assertGmailAddress(body.email);
    const verificationCode = String(body.verificationCode ?? "").trim();
    await verifyVerificationCode(email, verificationCode, "PASSWORD_RESET");

    return cors(NextResponse.json({ success: true, message: "Code verified" }));
  } catch (error: unknown) {
    return cors(
      NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Could not verify the code",
        },
        { status: 400 },
      ),
    );
  }
}
