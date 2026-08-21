import { NextRequest, NextResponse } from "next/server";

import { cors, optionsResponse } from "@/lib/cors";
import { verifyUserToken } from "@/lib/user-jwt";
import { prisma } from "@/lib/prisma";
import { getVodEntitlement } from "@/services/vod-entitlement.service";

const DAILY_CREDIT_AMOUNT = 1;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function getUserId(request: NextRequest) {
  const token = request.cookies.get("user_token")?.value;
  if (!token) return null;
  const payload = await verifyUserToken(token);
  return Number(payload.id);
}

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) return cors(NextResponse.json({ message: "Unauthorized" }, { status: 401 }));
    const entitlement = await getVodEntitlement(userId);
    return cors(NextResponse.json({ creditBalance: entitlement.creditBalance }));
  } catch (error) {
    console.error("Credit balance lookup failed", error);
    return cors(NextResponse.json({ message: "Unauthorized" }, { status: 401 }));
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) return cors(NextResponse.json({ message: "Unauthorized" }, { status: 401 }));

    const eventKey = `daily:${userId}:${todayKey()}`;
    try {
      await prisma.creditLedger.create({
        data: {
          userId,
          amount: DAILY_CREDIT_AMOUNT,
          eventType: "DAILY_CLAIM",
          eventKey,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      if (message.includes("duplicate") || message.includes("unique") || message.includes("23505")) {
        return cors(NextResponse.json({ message: "Daily credit already claimed" }, { status: 409 }));
      }
      throw error;
    }

    const entitlement = await getVodEntitlement(userId);
    return cors(NextResponse.json({ success: true, creditBalance: entitlement.creditBalance }));
  } catch (error) {
    console.error("Daily credit claim failed", error);
    return cors(NextResponse.json({ message: "Could not claim daily credit" }, { status: 500 }));
  }
}
