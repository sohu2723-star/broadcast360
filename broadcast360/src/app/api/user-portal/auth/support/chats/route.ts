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
    const token = request.cookies.get("user_token")?.value;

    if (!token) {
      return cors(
        NextResponse.json(
          { message: "Unauthorized" },
          { status: 401 },
        ),
      );
    }

    const payload = await verifyUserToken(token);
    const userId = Number(payload.id);

    const premium = await isUserPremium(userId);

    if (!premium) {
      return cors(
        NextResponse.json(
          {
            message:
              "Premium subscription is required to use support chat.",
          },
          { status: 403 },
        ),
      );
    }

    const conversations =
      await prisma.supportConversation.findMany({
        where: {
          userId,
        },

        include: {
          messages: {
            orderBy: {
              createdAt: "desc",
            },

            take: 1,

            select: {
              id: true,
              message: true,
              senderRole: true,
              isRead: true,
              createdAt: true,
            },
          },
        },

        orderBy: {
          updatedAt: "desc",
        },
      });

    return cors(
      NextResponse.json({
        success: true,
        data: conversations,
      }),
    );
  } catch (error) {
    console.error(
      "USER PREMIUM CHATS GET ERROR:",
      error,
    );

    return cors(
      NextResponse.json(
        {
          message: "Failed to load conversations.",
        },
        { status: 500 },
      ),
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("user_token")?.value;

    if (!token) {
      return cors(
        NextResponse.json(
          { message: "Unauthorized" },
          { status: 401 },
        ),
      );
    }

    const payload = await verifyUserToken(token);
    const userId = Number(payload.id);

    const premium = await isUserPremium(userId);

    if (!premium) {
      return cors(
        NextResponse.json(
          {
            message:
              "Premium subscription is required to use support chat.",
          },
          { status: 403 },
        ),
      );
    }

    const conversation =
      await prisma.supportConversation.create({
        data: {
          userId,
        },
      });

    return cors(
      NextResponse.json(
        {
          success: true,
          data: conversation,
        },
        { status: 201 },
      ),
    );
  } catch (error) {
    console.error(
      "USER PREMIUM CHAT CREATE ERROR:",
      error,
    );

    return cors(
      NextResponse.json(
        {
          message: "Failed to create conversation.",
        },
        { status: 500 },
      ),
    );
  }
}