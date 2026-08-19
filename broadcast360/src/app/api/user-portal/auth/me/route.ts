import { NextRequest, NextResponse } from "next/server";

import { cors, optionsResponse } from "@/lib/cors";
import { verifyUserToken } from "@/lib/user-jwt";
import { UserRepository } from "@/repositories/user.repository";

import { prisma } from "@/lib/prisma";

const userRepository = new UserRepository();

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("user_token")?.value;

    if (!token) {
      return cors(
        NextResponse.json(
          {
            message: "Unauthorized",
          },
          {
            status: 401,
          },
        ),
      );
    }

    const payload = await verifyUserToken(token);

    const userId = Number(payload.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return cors(
        NextResponse.json(
          {
            message: "Invalid user.",
          },
          {
            status: 401,
          },
        ),
      );
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      return cors(
        NextResponse.json(
          {
            message: "User not found",
          },
          {
            status: 404,
          },
        ),
      );
    }

    // =====================================================
    // FIND CURRENT SUBSCRIPTION
    // =====================================================

    const subscription =
      await prisma.subscription.findFirst({
        where: {
          userId,

          status: {
            in: [
              "ACTIVE",
              "PENDING",
            ],
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          plan: true,
          option: true,
        },
      });

    // =====================================================
    // RESPONSE
    // =====================================================

    return cors(
      NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          role: user.role,
          status: user.status,

          subscription: subscription
  ? {
      id: subscription.id,
      status: subscription.status,

      planId: subscription.planId,

      planName:
        subscription.plan?.name ?? null,

      optionId: subscription.optionId,

      durationDays:
        subscription.option?.durationDays ?? null,

      price:
        subscription.option?.price != null
          ? Number(subscription.option.price)
          : null,

      discountPercent:
        subscription.option?.discountPercent != null
          ? Number(
              subscription.option.discountPercent,
            )
          : 0,

      createdAt: subscription.createdAt,

      startedAt: subscription.startDate,

      expiresAt: subscription.endDate,
    }
  : null,
        },
      }),
    );
  } catch (error) {
    console.error(
      "GET CURRENT USER ERROR:",
      error,
    );

    return cors(
      NextResponse.json(
        {
          message: "Invalid token",
        },
        {
          status: 401,
        },
      ),
    );
  }
}