import { NextRequest, NextResponse } from "next/server";

import { UserService } from "@/services/user.service";
import { createUserSchema } from "@/lib/validators/user.validator";

const userService = new UserService();

/*
=========================
GET ALL USERS
=========================
*/

export async function GET() {
  try {
    const users = await userService.getUsers();

    return NextResponse.json(
      {
        success: true,
        users,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("GET USERS ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      {
        status: 500,
      },
    );
  }
}

/*
=========================
CREATE USER
=========================
*/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,

          message: "Validation failed",

          errors: validation.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const user = await userService.createUser(validation.data);

    // Remove password before response

    const { password, ...safeUser } = user;

    return NextResponse.json(
      {
        success: true,

        user: safeUser,
      },
      {
        status: 201,
      },
    );
  } catch (error: unknown) {
    console.error("CREATE USER ERROR", error);

    const message =
      error instanceof Error ? error.message : "Create user failed";

    return NextResponse.json(
      {
        success: false,

        message: message,
      },
      {
        status: 500,
      },
    );
  }
}
