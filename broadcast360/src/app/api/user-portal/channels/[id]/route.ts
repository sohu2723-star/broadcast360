import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3001",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await params;

    const channel = await prisma.channel.findUnique({
      where: {
        id: Number(id),
      },

      include: {
        streams: true,
      },
    });

    if (!channel) {
      return NextResponse.json(
        {
          message: "Channel not found",
        },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    const result = {
      id: channel.id.toString(),

      name: channel.name,

      description: channel.description ?? "",

      logo: channel.logo,

      country: channel.country,

      /*
      =====================
        MEDIA MTX HLS
      =====================
      */

      playbackUrl: channel.streamKey
        ? `http://localhost:8888/channel/${channel.streamKey}/index.m3u8`
        : `http://localhost:3000/streams/channel-${channel.id}/index.m3u8`,

      streamKey: channel.streamKey,

      streams: channel.streams.map((stream) => ({
        id: stream.id,
        url: stream.url,
      })),
    };

    return NextResponse.json(result, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("PUBLIC CHANNEL BY ID ERROR:", error);

    return NextResponse.json(
      {
        message: "Cannot fetch channel",
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
