import { approveSubscriptionPayment } from "@/services/subscription.service";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: Props,
) {
  try {
    const { id } = await params;
    const subscriptionId = Number(id);

    if (
      !Number.isInteger(subscriptionId) ||
      subscriptionId <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid subscription ID" },
        { status: 400 },
      );
    }

    const result =
      await approveSubscriptionPayment(subscriptionId);

    return NextResponse.json({
      message: "Payment approved and subscription activated",
      data: result,
    });
  } catch (error) {
    console.error(
      "Failed to approve subscription payment:",
      error,
    );

    if (error instanceof Error) {
      switch (error.message) {
        case "SUBSCRIPTION_NOT_FOUND":
          return NextResponse.json(
            { error: "Subscription not found" },
            { status: 404 },
          );

        case "SUBSCRIPTION_NOT_PENDING":
          return NextResponse.json(
            {
              error:
                "Subscription is not in pending status",
            },
            { status: 409 },
          );

        case "PENDING_PAYMENT_NOT_FOUND":
          return NextResponse.json(
            {
              error:
                "No pending payment found for this subscription",
            },
            { status: 409 },
          );
      }
    }

    return NextResponse.json(
      {
        message: "Failed to approve payment",
      },
      { status: 500 },
    );
  }
}