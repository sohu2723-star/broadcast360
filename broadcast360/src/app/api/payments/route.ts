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

    // =================================================
    // PAGINATION
    // =================================================

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

    const skip = (page - 1) * limit;

    // =================================================
    // FILTERS
    // =================================================

    const search =
      searchParams.get("search")?.trim() ?? "";

    const status =
      searchParams.get("status")?.trim() ?? "";

    // =================================================
    // WHERE
    // =================================================

    const where: Prisma.PaymentWhereInput = {};

    // Actual PaymentStatus enum:
    // PENDING
    // PAID
    // REJECTED
    // FAILED

    if (
      status === "PENDING" ||
      status === "PAID" ||
      status === "REJECTED" ||
      status === "FAILED"
    ) {
      where.status = status;
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

    const [
      payments,
      total,
      paidCount,
      pendingCount,
      rejectedCount,
      failedCount,
      revenue,
    ] = await prisma.$transaction([
      // -------------------------------------------------
      // PAYMENTS
      // -------------------------------------------------

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

      // -------------------------------------------------
      // FILTERED TOTAL
      // -------------------------------------------------

      prisma.payment.count({
        where,
      }),

      // -------------------------------------------------
      // PAID
      // -------------------------------------------------

      prisma.payment.count({
        where: {
          status: "PAID",
        },
      }),

      // -------------------------------------------------
      // PENDING
      // -------------------------------------------------

      prisma.payment.count({
        where: {
          status: "PENDING",
        },
      }),

      // -------------------------------------------------
      // REJECTED
      // -------------------------------------------------

      prisma.payment.count({
        where: {
          status: "REJECTED",
        },
      }),

      // -------------------------------------------------
      // FAILED
      // -------------------------------------------------

      prisma.payment.count({
        where: {
          status: "FAILED",
        },
      }),

      // -------------------------------------------------
      // TOTAL REVENUE
      // ONLY PAID PAYMENTS
      // -------------------------------------------------

      prisma.payment.aggregate({
        where: {
          status: "PAID",
        },

        _sum: {
          amount: true,
        },
      }),
    ]);

    // =================================================
    // SERIALIZE DECIMAL
    // =================================================

    const serializedPayments = payments.map((payment) => ({
      ...payment,

      amount: payment.amount.toString(),

      subscription: {
        ...payment.subscription,

        option: payment.subscription.option
          ? {
              ...payment.subscription.option,

              price:
                payment.subscription.option.price.toString(),

              discountPercent:
                payment.subscription.option.discountPercent.toString(),
            }
          : null,
      },
    }));

    // =================================================
    // RESPONSE
    // =================================================

    return cors(
      NextResponse.json({
        success: true,

        data: serializedPayments,

        summary: {
          totalRevenue:
            revenue._sum.amount?.toString() ?? "0",

          paidCount,

          pendingCount,

          rejectedCount,

          failedCount,
        },

        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
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