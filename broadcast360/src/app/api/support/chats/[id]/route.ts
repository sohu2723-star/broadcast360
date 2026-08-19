
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
// GET ONE CONVERSATION
// =====================================================

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
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

    const { id } = await params;

    const conversationId = Number(id);

    if (!Number.isInteger(conversationId)) {
      return cors(
        NextResponse.json(
          {
            message:
              "Invalid conversation ID.",
          },
          { status: 400 },
        ),
      );
    }

    const conversation =
      await prisma.supportConversation.findUnique({
        where: {
          id: conversationId,
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

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
            message:
              "Conversation not found.",
          },
          { status: 404 },
        ),
      );
    }

    // Mark USER messages as read
    await prisma.supportMessage.updateMany({
      where: {
        conversationId,
        senderRole: "USER",
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
      "ADMIN SUPPORT CHAT GET ERROR:",
      error,
    );

    return cors(
      NextResponse.json(
        {
          message:
            "Failed to load conversation.",
        },
        { status: 500 },
      ),
    );
  }
}

// =====================================================
// ADMIN SEND MESSAGE / CLOSE CHAT
// =====================================================

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
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

    const { id } = await params;

    const conversationId = Number(id);

    if (!Number.isInteger(conversationId)) {
      return cors(
        NextResponse.json(
          {
            message:
              "Invalid conversation ID.",
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
            message:
              "Message is required.",
          },
          { status: 400 },
        ),
      );
    }

    if (message.length > 5000) {
      return cors(
        NextResponse.json(
          {
            message:
              "Message is too long.",
          },
          { status: 400 },
        ),
      );
    }

    const conversation =
      await prisma.supportConversation.findUnique({
        where: {
          id: conversationId,
        },
      });

    if (!conversation) {
      return cors(
        NextResponse.json(
          {
            message:
              "Conversation not found.",
          },
          { status: 404 },
        ),
      );
    }

    if (
      conversation.status ===
      "CLOSED"
    ) {
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

    const adminId = Number(
      admin.id,
    );

    const supportMessage =
      await prisma.supportMessage.create({
        data: {
          conversationId,

          senderId: adminId,

          senderRole: "ADMIN",

          message,

          isRead: false,
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
      "ADMIN SUPPORT CHAT SEND ERROR:",
      error,
    );

    return cors(
      NextResponse.json(
        {
          message:
            "Failed to send message.",
        },
        { status: 500 },
      ),
    );
  }
}

// =====================================================
// CLOSE CONVERSATION
// =====================================================

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
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

    const { id } = await params;

    const conversationId = Number(id);

    if (!Number.isInteger(conversationId)) {
      return cors(
        NextResponse.json(
          {
            message:
              "Invalid conversation ID.",
          },
          { status: 400 },
        ),
      );
    }

    const conversation =
      await prisma.supportConversation.findUnique({
        where: {
          id: conversationId,
        },
      });

    if (!conversation) {
      return cors(
        NextResponse.json(
          {
            message:
              "Conversation not found.",
          },
          { status: 404 },
        ),
      );
    }

    const updatedConversation =
      await prisma.supportConversation.update({
        where: {
          id: conversationId,
        },

        data: {
          status: "CLOSED",
          updatedAt: new Date(),
        },
      });

    return cors(
      NextResponse.json({
        success: true,
        data: updatedConversation,
      }),
    );
  } catch (error) {
    console.error(
      "ADMIN SUPPORT CHAT CLOSE ERROR:",
      error,
    );

    return cors(
      NextResponse.json(
        {
          message:
            "Failed to close conversation.",
        },
        { status: 500 },
      ),
    );
  }
}