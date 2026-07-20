import { NextRequest, NextResponse } from "next/server";
import { BroadcastService } from "@/services/broadcast.service";

const service = new BroadcastService();

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId } = await context.params;
    const result = await service.stopBroadcast(Number(channelId));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to stop broadcast" },
      { status: 500 }
    );
  }
}