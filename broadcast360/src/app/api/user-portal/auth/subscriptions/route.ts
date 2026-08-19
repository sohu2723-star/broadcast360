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
// CREATE / REUSE / CHANGE SUBSCRIPTION
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
            message: "Unauthorized.",
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
            message: "Invalid user.",
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

    const body =
      await request.json();

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
              "Invalid subscription option.",
          },
          {
            status: 400,
          }
        )
      );
    }

    // =================================================
    // FIND OPTION
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
              "Subscription option not found or inactive.",
          },
          {
            status: 404,
          }
        )
      );
    }

    // =================================================
    // CHECK ACTIVE SUBSCRIPTION
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

        include: {
          plan: true,
          option: true,
        },
      });

    // =================================================
    // ALREADY SUBSCRIBED
    // =================================================

    if (activeSubscription) {
      return cors(
        NextResponse.json(
          {
            success: false,

            alreadySubscribed: true,

            message:
              "You are already subscribed to the Premium plan.",

            subscription: {
              id: activeSubscription.id,
              userId:
                activeSubscription.userId,
              planId:
                activeSubscription.planId,
              optionId:
                activeSubscription.optionId,
              status:
                activeSubscription.status,
              planName:
                activeSubscription.plan.name,
            },
          },
          {
            status: 409,
          }
        )
      );
    }

    // =================================================
    // FIND EXISTING PENDING SUBSCRIPTION
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

          payments: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

    // =====================================================
    // EXISTING PENDING SUBSCRIPTION
    // =====================================================

    if (pendingSubscription) {

      const latestPayment =
        pendingSubscription.payments?.[0] ?? null;

      // ===================================================
      // PAYMENT ALREADY PENDING
      // ===================================================
      //
      // IMPORTANT:
      // Once payment is submitted, the subscription is
      // LOCKED until admin reviews it.
      //
      // User cannot:
      // - choose another option
      // - create another subscription
      // - create another payment
      // - go back to payment and submit again
      //
      // ===================================================

      if (
        latestPayment?.status === "PENDING"
      ) {
        return cors(
          NextResponse.json(
            {
              success: false,

              paymentPending: true,

              subscriptionLocked: true,

              message:
                "Your payment is already pending review. Please wait for the payment to be reviewed before choosing another subscription.",

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

              payment: {
                id:
                  latestPayment.id,

                status:
                  latestPayment.status,
              },
            },
            {
              status: 409,
            }
          )
        );
      }

      // ===================================================
      // PAYMENT ALREADY PAID
      // ===================================================

      if (
        latestPayment?.status === "PAID"
      ) {
        return cors(
          NextResponse.json(
            {
              success: false,

              paymentCompleted: true,

              subscriptionLocked: true,

              message:
                "Your payment has already been submitted and is waiting for admin verification.",

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
            },
            {
              status: 409,
            }
          )
        );
      }

      // ===================================================
      // NO PAYMENT OR PAYMENT REJECTED
      // ===================================================
      //
      // Only NOW can the user change their option.
      //
      // ===================================================

      if (
        pendingSubscription.optionId !==
        option.id
      ) {

        await prisma.$transaction(
          async (tx) => {

            await tx.payment.deleteMany({
              where: {
                subscriptionId:
                  pendingSubscription.id,
              },
            });

            await tx.subscription.delete({
              where: {
                id:
                  pendingSubscription.id,
              },
            });

          }
        );

        // Continue below and create the new subscription.
      }

      // ===================================================
      // SAME OPTION
      // ===================================================

      else {

        const price =
          Number(
            pendingSubscription.option.price
          );

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

              paymentRequired: true,

              message:
                "You already have a pending subscription. Please continue to payment.",

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
                original:
                  price,

                discountPercent:
                  discount,

                discountAmount,

                final:
                  finalPrice,
              },
            },
            {
              status: 200,
            }
          )
        );
      }
    }
    // =================================================
    // CREATE NEW PENDING SUBSCRIPTION
    // =================================================

    const price =
      Number(option.price);

    const discount =
      Number(option.discountPercent);

    const discountAmount =
      price * (discount / 100);

    const finalPrice =
      price - discountAmount;

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

          changedPlan:
            !!pendingSubscription,

          paymentRequired: true,

          message:
            pendingSubscription
              ? "Your subscription option has been changed."
              : "Subscription created successfully.",

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
            original:
              price,

            discountPercent:
              discount,

            discountAmount,

            final:
              finalPrice,
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
              : "Failed to create subscription.",
        },
        {
          status: 500,
        }
      )
    );
  }
}