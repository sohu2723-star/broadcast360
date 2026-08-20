import { NextRequest, NextResponse } from "next/server";

import { cors, optionsResponse } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import { verifyUserToken } from "@/lib/user-jwt";

const EVENTS = new Set(["start", "heartbeat", "end"]);

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const channelId = Number(body?.channelId);
    const sessionKey = String(body?.sessionKey ?? "").trim();
    const viewerKey = String(body?.viewerKey ?? sessionKey).trim();
    const event = String(body?.event ?? "heartbeat").trim().toLowerCase();

    if (!Number.isInteger(channelId) || channelId <= 0 || !sessionKey || sessionKey.length > 160 || !viewerKey || viewerKey.length > 160 || !EVENTS.has(event)) {
      return cors(NextResponse.json({ success: false, message: "Invalid live-view analytics payload" }, { status: 400 }));
    }

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      select: { id: true },
    });

    if (!channel) {
      return cors(NextResponse.json({ success: false, message: "Channel not found" }, { status: 404 }));
    }

    let userId: number | null = null;
    const token = request.cookies.get("user_token")?.value;
    if (token) {
      try {
        const payload = await verifyUserToken(token);
        const parsedId = Number(payload.id);
        if (Number.isInteger(parsedId) && parsedId > 0) userId = parsedId;
      } catch {
        // Anonymous live-view telemetry is allowed; an invalid optional token is ignored.
      }
    }

    if (event === "end") {
      await prisma.liveViewerSession.updateMany({
        where: { sessionKey, channelId, endedAt: null },
        data: { endedAt: new Date(), lastSeenAt: new Date() },
      });
      return cors(NextResponse.json({ success: true }));
    }

    const broadcastSession = await prisma.broadcastSession.findFirst({
      where: { channelId, status: "LIVE" },
      select: { id: true },
    });

    await prisma.liveViewerSession.upsert({
      where: { sessionKey },
      create: {
        sessionKey,
        viewerKey,
        userId,
        channelId,
        broadcastSessionId: broadcastSession?.id ?? null,
      },
      update: {
        viewerKey,
        userId,
        channelId,
        broadcastSessionId: broadcastSession?.id ?? null,
        lastSeenAt: new Date(),
        endedAt: null,
      },
    });

    return cors(NextResponse.json({ success: true }));
  } catch (error) {
    console.error("LIVE VIEW ANALYTICS ERROR:", error);
    return cors(NextResponse.json({ success: false, message: "Live analytics unavailable" }, { status: 500 }));
  }
}
