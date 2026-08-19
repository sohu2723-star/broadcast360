
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
// GET SUBSCRIPTION
// =====================================================

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    // =================================================
    // AUTHENTICATION
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

    // =================================================
    // VERIFY TOKEN
    // =================================================

    const payload =
      await verifyUserToken(token);

    const userId =
      Number(payload.id);

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
    // GET SUBSCRIPTION ID
    // =================================================

    const { id } =
      await context.params;

    const subscriptionId =
      Number(id);

    if (
      !Number.isInteger(subscriptionId) ||
      subscriptionId <= 0
    ) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message: "Invalid subscription ID",
          },
          {
            status: 400,
          }
        )
      );
    }

    // =================================================
    // FIND USER'S SUBSCRIPTION
    // =================================================

    const subscription =
      await prisma.subscription.findFirst({
        where: {
          id: subscriptionId,
          userId,
        },

        include: {
          option: true,
          plan: true,
        },
      });

    // =================================================
    // NOT FOUND
    // =================================================

    if (!subscription) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message: "Subscription not found.",
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
      NextResponse.json(
        {
          success: true,

          subscription: {
            id: subscription.id,
            userId: subscription.userId,
            planId: subscription.planId,
            optionId: subscription.optionId,
            status: subscription.status,
            startDate: subscription.startDate,
            endDate: subscription.endDate,

            option: {
              id: subscription.option.id,
              planId: subscription.option.planId,
              durationDays:
                subscription.option.durationDays,
              price: subscription.option.price,
              discountPercent:
                subscription.option.discountPercent,
              isActive:
                subscription.option.isActive,
            },

            plan: {
              id: subscription.plan.id,
              name: subscription.plan.name,
              description:
                subscription.plan.description,
            },
          },
        },
        {
          status: 200,
        }
      )
    );
  } catch (error: unknown) {
    console.error(
      "GET SUBSCRIPTION ERROR:",
      error
    );

    return cors(
      NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Failed to load subscription.",
        },
        {
          status: 500,
        }
      )
    );
  }
}
