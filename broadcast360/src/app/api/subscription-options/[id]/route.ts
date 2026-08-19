import {
  deleteSubscriptionOption,
  getSubscriptionOptionById,
  updateSubscriptionOption,
} from "@/services/subscription-option.service";

import { NextRequest, NextResponse } from "next/server";

import {
  updateSubscriptionOptionSchema,
} from "@/lib/validators/subscription-option.validator";

import { Prisma } from "@/generated/prisma/client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: Props,
) {
  try {
    const { id } = await params;

    const optionId = Number(id);

    if (
      !Number.isInteger(optionId) ||
      optionId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid subscription option ID",
        },
        { status: 400 },
      );
    }

    const option =
      await getSubscriptionOptionById(
        optionId,
      );

    if (!option) {
      return NextResponse.json(
        {
          error:
            "Subscription option not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(option);
  } catch (error) {
    console.error(
      "Failed to get subscription option:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Failed to get subscription option",
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

    const optionId = Number(id);

    if (
      !Number.isInteger(optionId) ||
      optionId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid subscription option ID",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const result =
      updateSubscriptionOptionSchema.safeParse(
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

    const existing =
      await getSubscriptionOptionById(
        optionId,
      );

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Subscription option not found",
        },
        { status: 404 },
      );
    }

    const option =
      await updateSubscriptionOption(
        optionId,
        result.data,
      );

    return NextResponse.json(option);
  } catch (error) {
    console.error(
      "Failed to update subscription option:",
      error,
    );

    // Duplicate plan + duration
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "This duration already exists for this plan.",
        },
        { status: 409 },
      );
    }

    // Service-level duplicate check
    if (
      error instanceof Error &&
      error.message ===
        "SUBSCRIPTION_OPTION_ALREADY_EXISTS"
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
          "Failed to update subscription option",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Props,
) {
  try {
    const { id } = await params;

    const optionId = Number(id);

    if (
      !Number.isInteger(optionId) ||
      optionId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid subscription option ID",
        },
        { status: 400 },
      );
    }

    const existing =
      await getSubscriptionOptionById(
        optionId,
      );

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Subscription option not found",
        },
        { status: 404 },
      );
    }

    // Don't delete an option already used
    // by a subscription.
    if (
      existing.subscriptions.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot delete an option that has subscriptions. Deactivate it instead.",
        },
        { status: 409 },
      );
    }

    await deleteSubscriptionOption(
      optionId,
    );

    return NextResponse.json({
      message:
        "Subscription option deleted successfully",
    });
  } catch (error) {
    console.error(
      "Failed to delete subscription option:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Failed to delete subscription option",
      },
      { status: 500 },
    );
  }
}