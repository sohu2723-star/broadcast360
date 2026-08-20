import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyUserToken } from "@/lib/user-jwt";
import { cors, optionsResponse } from "@/lib/cors";
import { isUserInactiveByInactivity } from "@/services/auth.service";

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
            success: false,
            message: "Unauthorized",
          },
          { status: 401 }
        )
      );
    }

    const payload = await verifyUserToken(token);
    const userId = Number(payload.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message: "Invalid user.",
          },
          { status: 401 }
        )
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true, lastLoginAt: true, createdAt: true, role: true },
    });

    if (!user || user.role !== "USER") {
      return cors(NextResponse.json({ success: false, message: "User not found" }, { status: 404 }));
    }

    if (user.status !== "ACTIVE" || isUserInactiveByInactivity(user.lastLoginAt, user.createdAt)) {
      if (user.status === "ACTIVE") {
        await prisma.user.update({ where: { id: userId }, data: { status: "INACTIVE" } });
      }
      return cors(NextResponse.json({ success: false, code: "INACTIVE_ACCOUNT", message: "Account inactive. Please request reactivation from Support." }, { status: 403 }));
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const isPremium =
      subscription?.plan?.name?.toUpperCase() === "PREMIUM";

    return cors(
      NextResponse.json({
        success: true,
        isPremium,
        subscription: subscription
          ? {
              id: subscription.id,
              status: subscription.status,
              planName: subscription.plan.name,
            }
          : null,
      })
    );
  } catch (error) {
    console.error("SUPPORT ACCESS ERROR:", error);

    return cors(
      NextResponse.json(
        {
          success: false,
          message: "Failed to load support access.",
        },
        { status: 500 }
      )
    );
  }
}