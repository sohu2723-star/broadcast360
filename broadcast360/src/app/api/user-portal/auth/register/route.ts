import { NextRequest, NextResponse } from "next/server";

import { createUserSchema } from "@/lib/validators/user.validator";

import { UserService } from "@/services/user.service";

import { cors, optionsResponse } from "@/lib/cors";

const userService = new UserService();

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = createUserSchema.safeParse(body);

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

    const user = await userService.createUser(validation.data);

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
