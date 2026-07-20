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

      playbackUrl: channel.streamKey
        ? `http://localhost:8888/live/${channel.streamKey}/index.m3u8`
        : null,
    }));

    return NextResponse.json(channels, {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {

    console.error(error);

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