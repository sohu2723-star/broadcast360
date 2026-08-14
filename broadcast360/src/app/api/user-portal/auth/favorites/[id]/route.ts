import {
  NextRequest,
  NextResponse,
} from "next/server";

import { verifyUserToken } from "@/lib/user-jwt";
import { prisma } from "@/lib/prisma";

import {
  cors,
  optionsResponse,
} from "@/lib/cors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// =====================================================
// OPTIONS
// =====================================================

export async function OPTIONS() {
  return optionsResponse();
}

// =====================================================
// DELETE ONE FAVORITE
// =====================================================

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    // =================================================
    // AUTH
    // =================================================

    const token =
      request.cookies.get("user_token")?.value;

    if (!token) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message: "Unauthorized",
          },
          {
            status: 401,
          }
        )
      );
    }

    const payload =
      await verifyUserToken(token);

    const userId = Number(payload.id);

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message: "Invalid user",
          },
          {
            status: 401,
          }
        )
      );
    }

    // =================================================
    // FAVORITE ID
    // =================================================

    const { id } = await context.params;

    const favoriteId = Number(id);

    if (
      !Number.isInteger(favoriteId) ||
      favoriteId <= 0
    ) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message: "Invalid favorite ID",
          },
          {
            status: 400,
          }
        )
      );
    }

    // =================================================
    // FIND ONLY THIS USER'S FAVORITE
    // =================================================

    const favorite =
      await prisma.favorite.findFirst({
        where: {
          id: favoriteId,
          userId,
        },
      });

    if (!favorite) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message: "Favorite not found",
          },
          {
            status: 404,
          }
        )
      );
    }

    // =================================================
    // DELETE
    // =================================================

    await prisma.favorite.delete({
      where: {
        id: favoriteId,
      },
    });

    console.log(
      "FAVORITE DELETED:",
      {
        userId,
        favoriteId,
      }
    );

    return cors(
      NextResponse.json({
        success: true,
        message:
          "Favorite removed successfully",
      })
    );
  } catch (error: unknown) {
    console.error(
      "DELETE FAVORITE ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to remove favorite";

    return cors(
      NextResponse.json(
        {
          success: false,
          message,
        },
        {
          status: 500,
        }
      )
    );
  }
}