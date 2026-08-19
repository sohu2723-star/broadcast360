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
// DELETE ONE HISTORY ITEM
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

    if (!Number.isInteger(userId) || userId <= 0) {
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
    // ID
    // =================================================

    const { id } = await context.params;

    const historyId = Number(id);

    if (
      !Number.isInteger(historyId) ||
      historyId <= 0
    ) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message: "Invalid history ID",
          },
          {
            status: 400,
          }
        )
      );
    }

    // =================================================
    // FIND ONLY THIS USER'S HISTORY
    // =================================================

    const history =
      await prisma.watchHistory.findFirst({
        where: {
          id: historyId,
          userId,
        },
      });

    if (!history) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              "Watch history item not found",
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

    await prisma.watchHistory.delete({
      where: {
        id: historyId,
      },
    });

    console.log(
      "WATCH HISTORY DELETED:",
      {
        userId,
        historyId,
      }
    );

    return cors(
      NextResponse.json({
        success: true,
        message:
          "Watch history item deleted successfully",
      })
    );
  } catch (error: unknown) {
    console.error(
      "DELETE WATCH HISTORY ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete watch history";

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