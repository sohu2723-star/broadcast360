import { NextRequest, NextResponse } from "next/server";

import { cors, optionsResponse } from "@/lib/cors";

import { verifyUserToken } from "@/lib/user-jwt";

import { UserRepository } from "@/repositories/user.repository";

const userRepository = new UserRepository();

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("user_token")?.value;

    console.log("USER TOKEN:", token);

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

    const user = await userRepository.findById(Number(payload.id));

    return cors(
      NextResponse.json({
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          phone: user?.phone,
          avatar: user?.avatar,
          role: user?.role,
        },
      }),
    );
  } catch (error) {
    console.error(error);

    return cors(
      NextResponse.json(
        {
          message: "Invalid token",
        },
        {
          status: 401,
        },
      ),
    );
  }
}
