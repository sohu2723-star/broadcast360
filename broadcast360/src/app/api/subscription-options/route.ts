import {
  createSubscriptionOption,
  fetchPaginatedSubscriptionOptions,
} from "@/services/subscription-option.service";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  createSubscriptionOptionSchema,
} from "@/lib/validators/subscription-option.validator";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result =
      createSubscriptionOptionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          errors:
            result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const plan =
      await prisma.subscriptionPlan.findUnique({
        where: {
          id: result.data.planId,
        },
      });

    if (!plan) {
      return NextResponse.json(
        {
          error: "Subscription plan not found",
        },
        { status: 404 },
      );
    }

    if (!plan.isActive) {
      return NextResponse.json(
        {
          error:
            "Subscription plan is inactive",
        },
        { status: 400 },
      );
    }

    const option =
      await createSubscriptionOption(
        result.data,
      );

    return NextResponse.json(option, {
      status: 201,
    });
  } catch (error) {
    console.error(
      "Database operation failed: to create subscription option",
      error,
    );

    /*
     * Prisma composite unique constraint:
     *
     * @@unique([planId, durationDays])
     *
     * This means the same duration cannot
     * be created twice for the same plan.
     */
    if (
      error instanceof Error &&
      error.message.includes(
        "Unique constraint",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "This duration already exists for this plan.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        message:
          "Failed to create subscription option",
      },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const page = Math.max(
      1,
      parseInt(
        searchParams.get("page") ?? "1",
        10,
      ) || 1,
    );

    const limit = Math.max(
      1,
      parseInt(
        searchParams.get("limit") ?? "10",
        10,
      ) || 10,
    );

    const planIdParam =
      searchParams.get("planId");

    const planId = planIdParam
      ? Number(planIdParam)
      : undefined;

    const result =
      await fetchPaginatedSubscriptionOptions(
        page,
        limit,
        planId,
      );

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Database operation failed: to get subscription options",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Failed to get subscription options",
      },
      { status: 500 },
    );
  }
}