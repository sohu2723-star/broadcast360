import { NextRequest, NextResponse } from "next/server";

import { verifyUserToken } from "@/lib/user-jwt";
import { verifyCaptchaChallenge } from "@/lib/captcha";

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
      return cors(NextResponse.json({ message: "You must accept the Broadcast360 policy" }, { status: 400 }));
    }
    if (!verifyCaptchaChallenge(body.captchaToken, body.captchaAnswer)) {
      return cors(NextResponse.json({ message: "CAPTCHA verification failed" }, { status: 400 }));
    }

    const dateOfBirth = body.dateOfBirth

      ? new Date(`${body.dateOfBirth}T00:00:00.000Z`)
      : undefined;

    if (dateOfBirth && Number.isNaN(dateOfBirth.getTime())) {
      return cors(
        NextResponse.json({ message: "Invalid date of birth" }, { status: 400 }),
      );
    }

    const allowedGenders = ["MALE", "FEMALE", "OTHER", "UNSPECIFIED"];
    if (body.gender && !allowedGenders.includes(body.gender)) {
      return cors(
        NextResponse.json({ message: "Invalid gender" }, { status: 400 }),
      );
    }

    const user = await authService.updateProfile(Number(payload.id), {
      name: typeof body.name === "string" ? body.name.trim() : undefined,
      email: body.email,
      phone: body.phone,
      avatar: body.avatar,
      dateOfBirth,
      gender: body.gender,
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
