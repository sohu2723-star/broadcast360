import { NextRequest, NextResponse } from "next/server";

import { publicRegisterSchema } from "@/lib/validators/user.validator";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { consumeVerificationCode } from "@/services/email-verification.service";

import { UserService } from "@/services/user.service";

import { cors, optionsResponse } from "@/lib/cors";

const userService = new UserService();

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = publicRegisterSchema.safeParse(body);

    if (!validation.success) {
      return cors(
        NextResponse.json(
          {
            success: false,

            message: "Validation failed",

            errors: validation.error.flatten().fieldErrors,
          },
          {
            status: 400,
          },
        ),
      );
    }

    if (!(await verifyTurnstileToken(validation.data.turnstileToken, request))) {
      return cors(
        NextResponse.json(
          { success: false, message: "Cloudflare security verification failed" },
          { status: 400 },
        ),
      );
    }

    await consumeVerificationCode(
      validation.data.email,
      validation.data.verificationCode,
      "REGISTER",
    );

    const user = await userService.createUser({
      name: validation.data.name,
      email: validation.data.email,
      password: validation.data.password,
      emailVerifiedAt: new Date(),
    });

    return cors(
      NextResponse.json(
        {
          success: true,

          message: "Register successful",

          user,
        },
        {
          status: 201,
        },
      ),
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Register failed";

    return cors(
      NextResponse.json(
        {
          success: false,
          message,
        },
        {
          status: 500,
        },
      ),
    );
  }
}
