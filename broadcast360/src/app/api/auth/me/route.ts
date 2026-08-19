import { NextRequest, NextResponse } from "next/server";

import { verifyToken } from "@/lib/jwt";

import { UserRepository } from "@/repositories/user.repository";

import { cors, optionsResponse } from "@/lib/cors";

const repository = new UserRepository();

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return cors(
        NextResponse.json(
          {
            user: null,
          },
          {
            status: 401,
          },
        ),
      );
    }

    const payload = await verifyToken(token);

    const user = await repository.findById(Number(payload.id));

    if (!user) {
      return cors(
        NextResponse.json(
          {
            user: null,
          },
          {
            status: 404,
          },
        ),
      );
    }

    return cors(
      NextResponse.json({
        success: true,

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
        },
      }),
    );
  } catch {
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
