import { NextRequest, NextResponse } from "next/server";

import { AdvertisementEventType } from "@/generated/prisma/client";
import { cors, optionsResponse } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import { verifyUserToken } from "@/lib/user-jwt";

const EVENT_TYPES = new Set(Object.values(AdvertisementEventType));

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const advertisementId = Number(body?.advertisementId);
    const eventType = String(body?.eventType ?? "").trim().toUpperCase() as AdvertisementEventType;
    const sessionKey = body?.sessionKey ? String(body.sessionKey).trim().slice(0, 160) : null;

    if (!Number.isInteger(advertisementId) || advertisementId <= 0 || !EVENT_TYPES.has(eventType)) {
      return cors(NextResponse.json({ success: false, message: "Invalid advertisement analytics payload" }, { status: 400 }));
    }

    const advertisement = await prisma.advertisement.findUnique({
      where: { id: advertisementId },
      select: { id: true, active: true },
    });

    if (!advertisement || !advertisement.active) {
      return cors(NextResponse.json({ success: false, message: "Advertisement not found or inactive" }, { status: 404 }));
    }

    let userId: number | null = null;
    const token = request.cookies.get("user_token")?.value;
    if (token) {
      try {
        const payload = await verifyUserToken(token);
        const parsedId = Number(payload.id);
        if (Number.isInteger(parsedId) && parsedId > 0) userId = parsedId;
      } catch {
        // Anonymous ad analytics is allowed; invalid optional tokens are ignored.
      }
    }

    await prisma.advertisementEvent.create({
      data: {
        advertisementId,
        userId,
        sessionKey,
        eventType,
      },
    });

    return cors(NextResponse.json({ success: true }));
  } catch (error) {
    console.error("ADVERTISEMENT ANALYTICS ERROR:", error);
    return cors(NextResponse.json({ success: false, message: "Advertisement analytics unavailable" }, { status: 500 }));
  }
}
