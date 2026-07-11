import { NextResponse } from "next/server";
import { BroadcastService } from "@/services/broadcast.service";

const service = new BroadcastService();

export async function GET(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  return NextResponse.json(
    service.getStatus(Number(params.channelId))
  );
}