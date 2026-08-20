import { NextRequest, NextResponse } from "next/server";

import { cors, optionsResponse } from "@/lib/cors";
import { verifyUserToken } from "@/lib/user-jwt";
import { isUserPremium } from "@/services/subscription.service";
import { prisma } from "@/lib/prisma";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    // =====================================================
    // GET USER TOKEN
    // =====================================================

    const token =
      request.cookies.get("user_token")?.value;

    console.log(
      " SCHEDULE API - user_token:",
      token ? "FOUND" : "MISSING",
    );

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

    // =====================================================
    // VERIFY TOKEN
    // =====================================================

    const payload =
      await verifyUserToken(token);

    const userId = Number(payload.id);

    console.log(
      " SCHEDULE API - userId:",
      userId,
    );

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return cors(
        NextResponse.json(
          {
            message: "Invalid user",
          },
          {
            status: 401,
          },
        ),
      );
    }

    // =====================================================
    // PREMIUM CHECK
    // =====================================================

    const premium =
      await isUserPremium(userId);

    console.log(
      " SCHEDULE API - premium:",
      premium,
    );

    if (!premium) {
      return cors(
        NextResponse.json(
          {
            message:
              "Premium subscription required",
          },
          {
            status: 403,
          },
        ),
      );
    }

    // =====================================================
    // QUERY PARAMETERS
    // =====================================================

    const searchParams =
      request.nextUrl.searchParams;

    const pageParam = Number(
      searchParams.get("page") ?? "1",
    );

    const limitParam = Number(
      searchParams.get("limit") ?? "10",
    );

    const channelIdParam =
      searchParams.get("channelId");

    const page =
      Number.isInteger(pageParam) &&
      pageParam > 0
        ? pageParam
        : 1;

    const limit =
      Number.isInteger(limitParam) &&
      limitParam > 0 &&
      limitParam <= 50
        ? limitParam
        : 10;

    // =====================================================
    // CHANNEL FILTER
    // =====================================================

    let channelId: number | undefined;

    if (channelIdParam) {
      const parsedChannelId =
        Number(channelIdParam);

      if (
        Number.isInteger(parsedChannelId) &&
        parsedChannelId > 0
      ) {
        channelId = parsedChannelId;
      }
    }

    console.log(
      " SCHEDULE API - channelId:",
      channelId ?? "ALL",
    );

    // =====================================================
    // PAGINATION
    // =====================================================

    const skip = (page - 1) * limit;

    // =====================================================
    // DATE RANGE
    //
    // TODAY + NEXT 3 DAYS
    // =====================================================

    const now = new Date();

    const startOfToday =
      new Date(now);

    startOfToday.setHours(
      0,
      0,
      0,
      0,
    );

    const startOfFourthDay =
      new Date(startOfToday);

    startOfFourthDay.setDate(
      startOfFourthDay.getDate() + 4,
    );

    // =====================================================
    // WHERE
    // =====================================================

    const where = {
      startTime: {
        gte: startOfToday,
        lt: startOfFourthDay,
      },

      status: {
        not: "CANCELLED" as const,
      },

      ...(channelId !== undefined
        ? {
            channelId,
          }
        : {}),
    };

    console.log(
      " SCHEDULE API - where:",
      where,
    );

    // =====================================================
    // DATABASE
    // =====================================================

    const [data, total] =
      await prisma.$transaction([
        prisma.schedule.findMany({
          where,

          skip,
          take: limit,

          orderBy: {
            startTime: "asc",
          },

          include: {
            channel: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },

            playlist: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),

        prisma.schedule.count({
          where,
        }),
      ]);

    // =====================================================
    // RESPONSE
    // =====================================================

    return cors(
      NextResponse.json({
        data,

        pagination: {
          page,
          limit,
          total,

          totalPages:
            total === 0
              ? 0
              : Math.ceil(
                  total / limit,
                ),
        },

        dateRange: {
          from:
            startOfToday.toISOString(),

          to:
            startOfFourthDay.toISOString(),
        },

        selectedChannelId:
          channelId ?? null,
      }),
    );
  } catch (error) {
    console.error(
      "USER PORTAL SCHEDULE ERROR:",
      error,
    );

    return cors(
      NextResponse.json(
        {
          message:
            "Cannot load schedules",
        },
        {
          status: 500,
        },
      ),
    );
  }
}