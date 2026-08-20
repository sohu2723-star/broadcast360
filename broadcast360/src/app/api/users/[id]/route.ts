import { NextRequest, NextResponse } from "next/server";

import { UserService } from "@/services/user.service";
import { getAdminFromRequest } from "@/lib/admin-auth";

import { updateUserSchema } from "@/lib/validators/user.validator";

const userService = new UserService();

/*
=========================
GET USER BY ID
=========================
*/

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Admin authentication required" }, { status: 401 });
    }
    const { id } = await context.params;

    const user = await userService.getUser(Number(id));

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        user,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("GET USER ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user",
      },
      {
        status: 500,
      },
    );
  }
}

/*
=========================
UPDATE USER
=========================
*/

export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Admin authentication required" }, { status: 401 });
    }
    const { id } = await context.params;

    const body = await request.json();

    const validation = updateUserSchema.safeParse(body);

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

    const user = await userService.updateUser(Number(id), validation.data);

    return NextResponse.json({
      success: true,

      user,
    });
  } catch (error) {
    console.error("UPDATE USER ERROR", error);

    return NextResponse.json(
      {
        message: "Update user failed",
      },
      {
        status: 500,
      },
    );
  }
}

/*
=========================
DELETE USER
=========================
*/

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Admin authentication required" }, { status: 401 });
    }
    const { id } = await context.params;

    await userService.deleteUser(Number(id));

    return NextResponse.json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Delete failed",
      },
      {
        status: 500,
      },
    );
  }
}
