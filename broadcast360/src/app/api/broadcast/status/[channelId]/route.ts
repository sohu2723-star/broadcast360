import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ channelId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { channelId } = await context.params;
  const id = Number(channelId);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { error: "Invalid channel id" },
      { status: 400 },
    );
  }

  try {
    const session = await prisma.broadcastSession.findUnique({
      where: { channelId: id },
      select: {
        status: true,
        startedAt: true,
        stoppedAt: true,
        errorMessage: true,
        currentItemId: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ data: session });
  } catch (error) {
    console.error("GET BROADCAST STATUS ERROR", error);
    return NextResponse.json(
      { error: "Failed loading broadcast status" },
      { status: 500 },
    );
  }
}
