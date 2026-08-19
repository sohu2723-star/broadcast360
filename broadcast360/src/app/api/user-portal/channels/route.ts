import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3001",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
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

      accessType: channel.accessType,

      /*
       * IMPORTANT
       *
       * Do NOT expose the premium HLS URL here.
       *
       * FREE channels can be played directly.
       * PREMIUM channels must go through:
       *
       * /api/user-portal/channels/[id]
       *
       * where login + subscription are checked.
       */
      playbackUrl:
        channel.accessType === "FREE" && channel.streamKey
          ? `http://localhost:8888/channel/${channel.streamKey}/index.m3u8`
          : null,

      /*
       * Do not expose streamKey for premium channels.
       */
      streamKey:
        channel.accessType === "FREE"
          ? channel.streamKey
          : null,

      streams: channel.streams.map((stream) => ({
        id: stream.id,
        url: stream.url,
      })),
    }));

    return NextResponse.json(channels, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("PUBLIC CHANNEL API ERROR:", error);

    return NextResponse.json(
      {
        message: "Cannot fetch channels",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}