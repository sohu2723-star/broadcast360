import { prisma } from "@/lib/prisma";

function normalize(value: string) {
  return value.trim().slice(0, 512);
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function requestIp(request: Request) {
  return normalize(
    request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown",
  );
}

export async function registerDeviceSession(userId: number, request: Request, deviceId: string) {
  const deviceHash = await sha256(`device:${normalize(deviceId)}`);
  const ipHash = await sha256(`ip:${requestIp(request)}`);
  const userAgent = normalize(request.headers.get("user-agent") || "unknown").slice(0, 255);

  const existing = await prisma.deviceSession.findFirst({
    where: { userId, deviceHash },
    select: { id: true },
  });

  if (existing) {
    return prisma.deviceSession.update({
      where: { id: existing.id },
      data: { ipHash, userAgent, lastSeenAt: new Date(), revokedAt: null },
    });
  }

  const activeSessions = await prisma.deviceSession.findMany({
    where: { userId, revokedAt: null },
    orderBy: { lastSeenAt: "asc" },
    select: { id: true },
  });

  if (activeSessions.length >= 2) {
    await prisma.deviceSession.update({
      where: { id: activeSessions[0].id },
      data: { revokedAt: new Date() },
    });
  }

  return prisma.deviceSession.create({
    data: { userId, deviceHash, ipHash, userAgent, lastSeenAt: new Date() },
  });
}
