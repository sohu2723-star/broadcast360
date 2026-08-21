import { NextRequest, NextResponse } from "next/server";

import { cors, optionsResponse } from "@/lib/cors";
import { assertGmailAddress } from "@/lib/auth-policy";
import { UserRepository } from "@/repositories/user.repository";

const userRepository = new UserRepository();

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = assertGmailAddress(body.email);
    const user = await userRepository.findByEmail(email);
    const resettable = Boolean(user && user.role !== "ADMIN");

    return cors(
      NextResponse.json({
        success: true,
        exists: resettable,
        resettable,
      }),
    );
  } catch (error: unknown) {
    return cors(
      NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Could not check this Gmail account",
        },
        { status: 400 },
      ),
    );
  }
}
