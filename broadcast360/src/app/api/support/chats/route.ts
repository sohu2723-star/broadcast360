
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  cors,
  optionsResponse,
} from "@/lib/cors";

import { verifyToken } from "@/lib/jwt";

import { prisma } from "@/lib/prisma";

export async function OPTIONS() {
  return optionsResponse();
}

async function getAdmin(request: NextRequest) {
  const token =
    request.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);

  if (payload.role !== "ADMIN") {
    return null;
  }

  return payload;
}

// =====================================================
// GET ALL CONVERSATIONS
// =====================================================

export async function GET(
  request: NextRequest,
) {
  try {
    const admin = await getAdmin(request);

    if (!admin) {
      return cors(
        NextResponse.json(
          {
            message: "Unauthorized",
          },
          { status: 401 },
        ),
      );
    }

    const conversations =
      await prisma.supportConversation.findMany({
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

          user: {
            select: {
              id: true,
              name: true,
              email: true,
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
      "ADMIN SUPPORT CHATS GET ERROR:",
      error,
    );

    return cors(
      NextResponse.json(
        {
          message:
            "Failed to load support conversations.",
        },
        { status: 500 },
      ),
    );
  }
}
