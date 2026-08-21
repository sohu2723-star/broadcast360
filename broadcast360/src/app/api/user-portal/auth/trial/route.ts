import { NextRequest, NextResponse } from "next/server";

import { cors, optionsResponse } from "@/lib/cors";
import { verifyUserToken } from "@/lib/user-jwt";
import { prisma } from "@/lib/prisma";
import { getVodEntitlement } from "@/services/vod-entitlement.service";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("user_token")?.value;
    if (!token) {
      return cors(NextResponse.json({ message: "Unauthorized" }, { status: 401 }));
    }

    const payload = await verifyUserToken(token);
    const userId = Number(payload.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true, trialStartedAt: true, trialEndsAt: true },
    });

    if (!user || user.status !== "ACTIVE") {
      return cors(NextResponse.json({ message: "Account is not active" }, { status: 403 }));
    }

    if (user.trialStartedAt) {
      return cors(NextResponse.json({ message: "Your free trial has already been used" }, { status: 409 }));
    }

    const entitlement = await getVodEntitlement(userId);
    if (entitlement.isPremium) {
      return cors(NextResponse.json({ message: "Premium access is already active" }, { status: 409 }));
    }

    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + 24 * 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: userId },
      data: { trialStartedAt: startedAt, trialEndsAt: endsAt },
    });

    return cors(NextResponse.json({ success: true, trialEndsAt: endsAt }));
  } catch (error) {
    console.error("Trial activation failed", error);
    return cors(NextResponse.json({ message: "Could not activate trial" }, { status: 500 }));
  }
}
