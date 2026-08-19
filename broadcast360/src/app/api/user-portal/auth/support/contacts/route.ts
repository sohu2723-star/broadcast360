import { NextRequest, NextResponse } from "next/server";

import { cors, optionsResponse } from "@/lib/cors";
import { verifyUserToken } from "@/lib/user-jwt";
import { prisma } from "@/lib/prisma";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    // ============================================
    // AUTHENTICATION
    // ============================================

    const token =
      request.cookies.get("user_token")?.value;

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

    if (!userId) {
      return cors(
        NextResponse.json(
          {
            message: "Invalid user token",
          },
          {
            status: 401,
          },
        ),
      );
    }

    // ============================================
    // BODY
    // ============================================

    const body = await request.json();

    const subject =
      typeof body.subject === "string"
        ? body.subject.trim()
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!subject) {
      return cors(
        NextResponse.json(
          {
            message: "Subject is required.",
          },
          {
            status: 400,
          },
        ),
      );
    }

    if (!message) {
      return cors(
        NextResponse.json(
          {
            message: "Message is required.",
          },
          {
            status: 400,
          },
        ),
      );
    }

    // ============================================
    // GET USER
    // ============================================

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return cors(
        NextResponse.json(
          {
            message: "User not found.",
          },
          {
            status: 404,
          },
        ),
      );
    }

    // ============================================
    // CREATE CONTACT MESSAGE
    // ============================================

    const contactMessage =
      await prisma.contactMessage.create({
        data: {
          userId: user.id,
          name: user.name,
          email: user.email,
          subject,
          message,
        },
      });

    // ============================================
    // RESPONSE
    // ============================================

    return cors(
      NextResponse.json(
        {
          success: true,
          message:
            "Your message has been sent successfully.",
          data: contactMessage,
        },
        {
          status: 201,
        },
      ),
    );
  } catch (error) {
    console.error(
      "USER CONTACT MESSAGE ERROR:",
      error,
    );

    return cors(
      NextResponse.json(
        {
          message:
            "Failed to send contact message.",
        },
        {
          status: 500,
        },
      ),
    );
  }
}