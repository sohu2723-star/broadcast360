import { NextRequest, NextResponse } from "next/server";

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
// CREATE / REUSE SUBSCRIPTION
// =====================================================

export async function POST(
  request: NextRequest
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
    // REQUEST BODY
    // =================================================

    const body = await request.json();

    const optionId =
      Number(body.optionId);

    if (
      !Number.isInteger(optionId) ||
      optionId <= 0
    ) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              "Invalid subscription option",
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

    if (!option) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              "Subscription option not found or inactive",
          },
          {
            status: 404,
          }
        )
      );
    }

    // =================================================
    // CHECK EXISTING ACTIVE SUBSCRIPTION
    // =================================================

    const activeSubscription =
      await prisma.subscription.findFirst({
        where: {
          userId,
          status: "ACTIVE",
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    if (activeSubscription) {
      return cors(
        NextResponse.json(
          {
            success: false,

            message:
              "You already have an active subscription.",

            subscription: {
              id: activeSubscription.id,
              userId: activeSubscription.userId,
              planId: activeSubscription.planId,
              optionId: activeSubscription.optionId,
              status: activeSubscription.status,
            },
          },
          {
            status: 409,
          }
        )
      );
    }

    // =================================================
    // CHECK EXISTING PENDING SUBSCRIPTION
    // =================================================

    const pendingSubscription =
      await prisma.subscription.findFirst({
        where: {
          userId,
          status: "PENDING",
        },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          option: true,
          plan: true,
        },
      });

    if (pendingSubscription) {
      // ===============================================
      // REUSE EXISTING PENDING SUBSCRIPTION
      // ===============================================

      const price =
        Number(pendingSubscription.option.price);

      const discount =
        Number(
          pendingSubscription.option.discountPercent
        );

      const discountAmount =
        price * (discount / 100);

      const finalPrice =
        price - discountAmount;

      return cors(
        NextResponse.json(
          {
            success: true,

            alreadyExists: true,

            message:
              "You already have a pending subscription. Continuing to payment.",

            subscriptionId:
              pendingSubscription.id,

            subscription: {
              id:
                pendingSubscription.id,

              userId:
                pendingSubscription.userId,

              planId:
                pendingSubscription.planId,

              optionId:
                pendingSubscription.optionId,

              status:
                pendingSubscription.status,
            },

            price: {
              original: price,
              discountPercent: discount,
              discountAmount,
              final: finalPrice,
            },
          },
          {
            status: 200,
          }
        )
      );
    }

    // =================================================
    // CALCULATE PRICE
    // =================================================

    const price =
      Number(option.price);

    const discount =
      Number(option.discountPercent);

    const discountAmount =
      price * (discount / 100);

    const finalPrice =
      price - discountAmount;

    // =================================================
    // CREATE PENDING SUBSCRIPTION
    // =================================================

    const subscription =
      await prisma.subscription.create({
        data: {
          userId,

          planId:
            option.planId,

          optionId:
            option.id,

          status:
            "PENDING",
        },
      });

    // =================================================
    // RESPONSE
    // =================================================

    return cors(
      NextResponse.json(
        {
          success: true,

          alreadyExists: false,

          message:
            "Subscription created successfully",

          subscriptionId:
            subscription.id,

          subscription: {
            id:
              subscription.id,

            userId:
              subscription.userId,

            planId:
              subscription.planId,

            optionId:
              subscription.optionId,

            status:
              subscription.status,
          },

          price: {
            original: price,
            discountPercent: discount,
            discountAmount,
            final: finalPrice,
          },
        },
        {
          status: 201,
        }
      )
    );
  } catch (error: unknown) {
    console.error(
      "CREATE SUBSCRIPTION ERROR:",
      error
    );

    return cors(
      NextResponse.json(
        {
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Failed to create subscription",
        },
        {
          status: 500,
        }
      )
    );
  }
}