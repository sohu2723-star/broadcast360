import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { cors, optionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

// =====================================================
// GET SINGLE PAYMENT
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
    const { id } = await context.params;

    const paymentId = Number(id);

    if (
      !Number.isInteger(paymentId) ||
      paymentId <= 0
    ) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message: "Invalid payment ID.",
          },
          {
            status: 400,
          }
        )
      );
    }

    const payment =
      await prisma.payment.findUnique({
        where: {
          id: paymentId,
        },

        include: {
          subscription: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },

              plan: true,

              option: true,
            },
          },
        },
      });

    if (!payment) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message: "Payment not found.",
          },
          {
            status: 404,
          }
        )
      );
    }

    const data = {
      ...payment,

      amount: Number(payment.amount),

      subscription: {
        ...payment.subscription,

        plan: {
          ...payment.subscription.plan,
        },

        option: {
          ...payment.subscription.option,

          price: Number(
            payment.subscription.option.price
          ),

          discountPercent: Number(
            payment.subscription.option
              .discountPercent
          ),
        },
      },
    };

    return cors(
      NextResponse.json(
        {
          success: true,
          data,
        },
        {
          status: 200,
        }
      )
    );
  } catch (error) {
    console.error(
      "GET PAYMENT ERROR:",
      error
    );

    return cors(
      NextResponse.json(
        {
          success: false,
          message: "Failed to load payment.",
        },
        {
          status: 500,
        }
      )
    );
  }
}

// =====================================================
// UPDATE PAYMENT STATUS
// =====================================================

export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    const paymentId = Number(id);

    if (
      !Number.isInteger(paymentId) ||
      paymentId <= 0
    ) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message: "Invalid payment ID.",
          },
          {
            status: 400,
          }
        )
      );
    }

    const body = await request.json();

    const status = body.status;

    if (
      ![
        "PENDING",
        "PAID",
        "REJECTED",
        "FAILED",
      ].includes(status)
    ) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message: "Invalid payment status.",
          },
          {
            status: 400,
          }
        )
      );
    }

    const payment =
      await prisma.payment.update({
        where: {
          id: paymentId,
        },

        data: {
          status,
        },
      });

    return cors(
      NextResponse.json(
        {
          success: true,
          data: payment,
          message:
            "Payment status updated successfully.",
        },
        {
          status: 200,
        }
      )
    );
  } catch (error) {
    console.error(
      "UPDATE PAYMENT ERROR:",
      error
    );

    return cors(
      NextResponse.json(
        {
          success: false,
          message:
            "Failed to update payment.",
        },
        {
          status: 500,
        }
      )
    );
  }
}