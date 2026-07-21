import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET() {
  try {
    const dbChannels = await prisma.channel.findMany({
      include: {
        streams: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const channels = dbChannels.map((channel) => ({
      id: channel.id.toString(),
      name: channel.name,
      description: channel.description ?? "",
      logo: channel.logo,
      country: channel.country,

      // If you later store stream URLs in DB, you can use:
      // const primaryStream = channel.streams?.[0];
      // streamUrl: primaryStream?.url ?? ""

      playbackUrl: channel.streamKey
        ? `http://localhost:8888/live/${channel.streamKey}/index.m3u8`
        : `http://localhost:3000/streams/channel-${channel.id}/index.m3u8`,
    }));

    return NextResponse.json(channels, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Prisma Fetch Error:", error);

    return NextResponse.json(
      {
        message: "Cannot fetch channels",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}