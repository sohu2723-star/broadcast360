import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyUserToken } from "@/lib/user-jwt";

import {
  cors,
  optionsResponse,
} from "@/lib/cors";

// =====================================================
// OPTIONS
// =====================================================

export async function OPTIONS() {
  return optionsResponse();
}

// =====================================================
// GET SINGLE SUBSCRIPTION OPTION
// =====================================================

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
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

    await verifyUserToken(token);

    // =================================================
    // PARAM
    // =================================================

    const { id } = await context.params;

    const optionId = Number(id);

    if (
      !Number.isInteger(optionId) ||
      optionId <= 0
    ) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message: "Invalid subscription option ID",
          },
          {
            status: 400,
          }
        )
      );
    }

    // =================================================
    // FIND ACTIVE OPTION
    // =================================================

    const option =
      await prisma.subscriptionOption.findFirst({
        where: {
          id: optionId,
          isActive: true,
        },
        include: {
          plan: true,
        },
      });

    // =================================================
    // NOT FOUND
    // =================================================

    if (!option) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              "Subscription option not found",
          },
          {
            status: 404,
          }
        )
      );
    }

    // =================================================
    // RESPONSE
    // =================================================

    return cors(
      NextResponse.json({
        success: true,
        option,
      })
    );
  } catch (error: unknown) {
    console.error(
      "GET SUBSCRIPTION OPTION ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to get subscription option";

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