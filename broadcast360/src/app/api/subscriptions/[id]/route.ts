import {
  deleteSubscription,
  getSubscriptionById,
  updateSubscription,
} from "@/services/subscription.service";
import { NextRequest, NextResponse } from "next/server";
import { updateSubscriptionSchema } from "@/lib/validators/subscription.validator";

interface Props {
  params: Promise<{ id: string }>;
}

// GET one subscription
export async function GET(
  request: NextRequest,
  { params }: Props,
) {
  try {
    const { id } = await params;
    const subscriptionId = Number(id);

    if (!Number.isInteger(subscriptionId) || subscriptionId <= 0) {
      return NextResponse.json(
        { error: "Invalid subscription ID" },
        { status: 400 },
      );
    }

    const subscription =
      await getSubscriptionById(subscriptionId);

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error(
      "Database operation failed: to get subscription",
      error,
    );

    return NextResponse.json(
      { message: "Failed to get subscription" },
      { status: 500 },
    );
  }
}

// UPDATE subscription
export async function PUT(
  request: NextRequest,
  { params }: Props,
) {
  try {
    const { id } = await params;
    const subscriptionId = Number(id);

    if (!Number.isInteger(subscriptionId) || subscriptionId <= 0) {
      return NextResponse.json(
        { error: "Invalid subscription ID" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const result = updateSubscriptionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const existing =
      await getSubscriptionById(subscriptionId);

    if (!existing) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    const subscription = await updateSubscription(
      subscriptionId,
      result.data,
    );

    return NextResponse.json(subscription);
  } catch (error) {
    console.error(
      "Database operation failed: to update subscription",
      error,
    );

    return NextResponse.json(
      { message: "Failed to update subscription" },
      { status: 500 },
    );
  }
}

// DELETE subscription
export async function DELETE(
  request: NextRequest,
  { params }: Props,
) {
  try {
    const { id } = await params;
    const subscriptionId = Number(id);

    if (!Number.isInteger(subscriptionId) || subscriptionId <= 0) {
      return NextResponse.json(
        { error: "Invalid subscription ID" },
        { status: 400 },
      );
    }

    const existing =
      await getSubscriptionById(subscriptionId);

    if (!existing) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    await deleteSubscription(subscriptionId);

    return NextResponse.json({
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    console.error(
      "Database operation failed: to delete subscription",
      error,
    );

    return NextResponse.json(
      { message: "Failed to delete subscription" },
      { status: 500 },
    );
  }
}