import { NextRequest, NextResponse } from "next/server";

import { UserService } from "@/services/user.service";
import { createUserSchema } from "@/lib/validators/user.validator";

const userService = new UserService();

/*
=========================
GET ALL USERS (PAGINATED & FILTERED)
=========================
*/

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters with defaults
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";

    // Call service with filters
    const { users, total } = await userService.getUsers({
      page,
      limit,
      search,
      role,
      status,
    });

    return NextResponse.json(
      {
        success: true,
        users,
        total,
        page,
        limit,
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
    // const { password, ...safeUser } = user;

    return NextResponse.json(
      {
        success: true,
        user,
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
