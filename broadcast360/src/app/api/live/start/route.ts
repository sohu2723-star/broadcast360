import { NextRequest, NextResponse } from "next/server";

import { LiveService } from "@/services/live.service";

const service = new LiveService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { channelId } = body;

    if (!channelId) {
      return NextResponse.json(
        {
          success: false,

          message: "channelId required",
        },
        {
          status: 400,
        },
      );
    }

    const result = await service.start(Number(channelId));

    return NextResponse.json({
      success: true,

      data: result,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,

        message: error,
      },
      {
        status: 500,
      },
    );
  }
}
