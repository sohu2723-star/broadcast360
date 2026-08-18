import { NextRequest, NextResponse } from "next/server";

import { cors, optionsResponse } from "@/lib/cors";
import { verifyUserToken } from "@/lib/user-jwt";
import { isUserPremium } from "@/services/subscription.service";
import { prisma } from "@/lib/prisma";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
              "Premium subscription is required.",
          },
          { status: 403 },
        ),
      );
    }

    const { id } = await params;
    const conversationId = Number(id);

    if (!Number.isInteger(conversationId)) {
      return cors(
        NextResponse.json(
          {
            message: "Invalid conversation ID.",
          },
          { status: 400 },
        ),
      );
    }

    const conversation =
      await prisma.supportConversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },

        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

    if (!conversation) {
      return cors(
        NextResponse.json(
          {
            message: "Conversation not found.",
          },
          { status: 404 },
        ),
      );
    }

    // Mark admin messages as read
    await prisma.supportMessage.updateMany({
      where: {
        conversationId,
        senderRole: "ADMIN",
        isRead: false,
      },

      data: {
        isRead: true,
      },
    });

    return cors(
      NextResponse.json({
        success: true,
        data: conversation,
      }),
    );
  } catch (error) {
    console.error(
      "USER PREMIUM CHAT GET ERROR:",
      error,
    );

    return cors(
      NextResponse.json(
        {
          message: "Failed to load conversation.",
        },
        { status: 500 },
      ),
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
              "Premium subscription is required.",
          },
          { status: 403 },
        ),
      );
    }

    const { id } = await params;
    const conversationId = Number(id);

    if (!Number.isInteger(conversationId)) {
      return cors(
        NextResponse.json(
          {
            message: "Invalid conversation ID.",
          },
          { status: 400 },
        ),
      );
    }

    const body = await request.json();

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return cors(
        NextResponse.json(
          {
            message: "Message is required.",
          },
          { status: 400 },
        ),
      );
    }

    if (message.length > 5000) {
      return cors(
        NextResponse.json(
          {
            message: "Message is too long.",
          },
          { status: 400 },
        ),
      );
    }

    const conversation =
      await prisma.supportConversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
      });

    if (!conversation) {
      return cors(
        NextResponse.json(
          {
            message: "Conversation not found.",
          },
          { status: 404 },
        ),
      );
    }

    if (conversation.status === "CLOSED") {
      return cors(
        NextResponse.json(
          {
            message:
              "This conversation is closed.",
          },
          { status: 400 },
        ),
      );
    }

    const supportMessage =
      await prisma.supportMessage.create({
        data: {
          conversationId,
          senderId: userId,
          senderRole: "USER",
          message,
        },
      });

    await prisma.supportConversation.update({
      where: {
        id: conversationId,
      },

      data: {
        updatedAt: new Date(),
      },
    });

    return cors(
      NextResponse.json(
        {
          success: true,
          data: supportMessage,
        },
        { status: 201 },
      ),
    );
  } catch (error) {
    console.error(
      "USER PREMIUM CHAT SEND ERROR:",
      error,
    );

    return cors(
      NextResponse.json(
        {
          message: "Failed to send message.",
        },
        { status: 500 },
      ),
    );
  }
}