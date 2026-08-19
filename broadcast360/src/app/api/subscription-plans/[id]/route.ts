import {
  deleteSubscriptionPlan,
  getSubscriptionPlanById,
  updateSubscriptionPlan,
} from "@/services/subscription-plan.service";
import { NextRequest, NextResponse } from "next/server";
import {
  updateSubscriptionPlanSchema,
} from "@/lib/validators/subscription-plan.validator";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

function getId(id: string) {
  const parsed = Number(id);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    return null;
  }

  return parsed;
}

export async function GET(
  _request: NextRequest,
  { params }: Props,
) {
  try {
    const { id } = await params;
    const planId = getId(id);

    if (!planId) {
      return NextResponse.json(
        { error: "Invalid plan ID" },
        { status: 400 },
      );
    }

    const plan =
      await getSubscriptionPlanById(
        planId,
      );

    return NextResponse.json(plan);
  } catch (error) {
    console.error(
      "Failed to get subscription plan:",
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        "SUBSCRIPTION_PLAN_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          error:
            "Subscription plan not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message:
          "Failed to get subscription plan",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Props,
) {
  try {
    const { id } = await params;
    const planId = getId(id);

    if (!planId) {
      return NextResponse.json(
        { error: "Invalid plan ID" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const result =
      updateSubscriptionPlanSchema.safeParse(
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
      await updateSubscriptionPlan(
        planId,
        result.data,
      );

    return NextResponse.json(plan);
  } catch (error) {
    console.error(
      "Failed to update subscription plan:",
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        "SUBSCRIPTION_PLAN_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          error:
            "Subscription plan not found",
        },
        { status: 404 },
      );
    }

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
          "Failed to update subscription plan",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: Props,
) {
  try {
    const { id } = await params;
    const planId = getId(id);

    if (!planId) {
      return NextResponse.json(
        { error: "Invalid plan ID" },
        { status: 400 },
      );
    }

    await deleteSubscriptionPlan(
      planId,
    );

    return NextResponse.json({
      message:
        "Subscription plan deleted successfully",
    });
  } catch (error) {
    console.error(
      "Failed to delete subscription plan:",
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        "SUBSCRIPTION_PLAN_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          error:
            "Subscription plan not found",
        },
        { status: 404 },
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "SUBSCRIPTION_PLAN_IN_USE"
    ) {
      return NextResponse.json(
        {
          error:
            "This plan cannot be deleted because it has subscription options or subscriptions.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        message:
          "Failed to delete subscription plan",
      },
      { status: 500 },
    );
  }
}