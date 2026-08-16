import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { cors, optionsResponse } from "@/lib/cors";

// =====================================================
// OPTIONS
// =====================================================

export async function OPTIONS() {
  return optionsResponse();
}

// =====================================================
// GET PAYMENTS
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const rawPage = Number(searchParams.get("page") ?? "1");
    const rawLimit = Number(searchParams.get("limit") ?? "10");

    const page =
      Number.isFinite(rawPage) && rawPage > 0
        ? Math.floor(rawPage)
        : 1;

    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0
        ? Math.min(Math.floor(rawLimit), 100)
        : 10;

    const search =
      searchParams.get("search")?.trim() ?? "";

    const status =
      searchParams.get("status")?.trim() ?? "";

    const skip = (page - 1) * limit;

    // =================================================
    // WHERE
    // =================================================

    const where: Prisma.PaymentWhereInput = {};

    // Your Prisma enum:
    // PENDING | PAID | REJECTED | FAILED

    if (
      status &&
      ["PENDING", "PAID", "REJECTED", "FAILED"].includes(status)
    ) {
      where.status =
        status as Prisma.PaymentWhereInput["status"];
    }

    // =================================================
    // SEARCH
    // =================================================

    if (search) {
      where.OR = [
        {
          transactionId: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          subscription: {
            user: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },

        {
          subscription: {
            user: {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

    // =================================================
    // DATABASE
    // =================================================

    const [payments, total] =
      await prisma.$transaction([
        prisma.payment.findMany({
          where,

          include: {
            subscription: {
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
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },

          skip,
          take: limit,
        }),

        prisma.payment.count({
          where,
        }),
      ]);

    // =================================================
    // SERIALIZE DECIMAL
    // =================================================

    const serializedPayments = payments.map(
      (payment) => ({
        ...payment,

        amount: Number(payment.amount),

        subscription: {
          ...payment.subscription,

          option: {
            ...payment.subscription.option,

            price: Number(
              payment.subscription.option.price
            ),

            discountPercent: Number(
              payment.subscription.option.discountPercent
            ),
          },
        },
      })
    );

    // =================================================
    // RESPONSE
    // =================================================

    return cors(
      NextResponse.json(
        {
          success: true,

          data: serializedPayments,

          pagination: {
            page,
            limit,
            total,

            totalPages:
              Math.ceil(total / limit),
          },
        },
        {
          status: 200,
        }
      )
    );
  } catch (error) {
    console.error(
      "GET PAYMENTS ERROR:",
      error
    );

    return cors(
      NextResponse.json(
        {
          success: false,
          message: "Failed to load payments.",
        },
        {
          status: 500,
        }
      )
    );
  }
}