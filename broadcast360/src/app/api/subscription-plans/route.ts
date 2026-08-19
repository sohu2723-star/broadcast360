import {
  createSubscriptionPlan,
  getSubscriptionPlans,
} from "@/services/subscription-plan.service";
import { NextRequest, NextResponse } from "next/server";
import {
  createSubscriptionPlanSchema,
} from "@/lib/validators/subscription-plan.validator";

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

    const search =
      searchParams.get("search") ??
      undefined;

    const result =
      await getSubscriptionPlans(
        page,
        limit,
        search,
      );

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Failed to get subscription plans:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Failed to get subscription plans",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    const result =
      createSubscriptionPlanSchema.safeParse(
        body,
      );

    if (!result.success) {
      return NextResponse.json(
        {
          errors:
            result.error.flatten()
              .fieldErrors,
        },
        { status: 400 },
      );
    }

    const plan =
      await createSubscriptionPlan(
        result.data,
      );

    return NextResponse.json(
      plan,
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Failed to create subscription plan:",
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        "SUBSCRIPTION_PLAN_NAME_EXISTS"
    ) {
      return NextResponse.json(
        {
          error:
            "Subscription plan name already exists",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        message:
          "Failed to create subscription plan",
      },
      { status: 500 },
    );
  }
}