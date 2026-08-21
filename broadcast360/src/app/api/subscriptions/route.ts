import { createUserSubscription } from "@/services/subscription.service";
import { NextRequest, NextResponse } from "next/server";
import { createUserSubscriptionSchema } from "@/lib/validators/user-subscription.validator";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(
      Number(searchParams.get("page") || 1),
      1,
    );

    const limit = Math.min(
      Math.max(
        Number(searchParams.get("limit") || 10),
        1,
      ),
      100,
    );

    const search =
      searchParams.get("search")?.trim() || "";

    const status =
      searchParams.get("status")?.trim() || "";

    const skip = (page - 1) * limit;

    // =====================================================
    // FILTER
    // =====================================================

    const where: any = {};

    if (
      status &&
      ["PENDING", "ACTIVE", "EXPIRED", "CANCELLED"].includes(
        status,
      )
    ) {
      where.status = status;
    }

    if (search) {
      where.user = {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      };
    }

    // =====================================================
    // GET DATA
    // =====================================================

    const [subscriptions, total] =
      await prisma.$transaction([
        prisma.subscription.findMany({
          where,

          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            plan: {
              select: {
                id: true,
                name: true,
              },
            },

            option: {
              select: {
                id: true,
                durationDays: true,
                price: true,
                discountPercent: true,
              },
            },

            payments: {
              orderBy: {
                createdAt: "desc",
              },

              select: {
                id: true,
                amount: true,
                currency: true,
                method: true,
                transactionId: true,
                screenshotUrl: true,
                status: true,
                createdAt: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },

          skip,
          take: limit,
        }),

        prisma.subscription.count({
          where,
        }),
      ]);

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json({
      success: true,

      data: subscriptions,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(
      "ADMIN SUBSCRIPTIONS GET ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch subscriptions.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    /*
     * IMPORTANT:
     * Replace this with your actual authentication/session
     * method used in FlickScope.
     */
    const userId = 1;

    const body = await request.json();

    const result =
      createUserSubscriptionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const subscription =
      await createUserSubscription(
        userId,
        result.data.optionId,
      );

    return NextResponse.json(
      {
        message:
          "Subscription created. Please complete payment.",
        data: subscription,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Failed to create user subscription:",
      error,
    );

    if (error instanceof Error) {
      switch (error.message) {
        case "ACTIVE_SUBSCRIPTION_EXISTS":
          return NextResponse.json(
            {
              error:
                "You already have an active Premium subscription.",
            },
            { status: 409 },
          );

        case "PENDING_SUBSCRIPTION_EXISTS":
          return NextResponse.json(
            {
              error:
                "You already have a pending subscription.",
            },
            { status: 409 },
          );

        case "SUBSCRIPTION_OPTION_NOT_FOUND":
          return NextResponse.json(
            {
              error:
                "Subscription option not found or inactive.",
            },
            { status: 404 },
          );
      }
    }

    return NextResponse.json(
      {
        message: "Failed to create subscription.",
      },
      { status: 500 },
    );
  }
}