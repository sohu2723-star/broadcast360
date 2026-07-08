import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const channels = dbChannels.map((channel) => {
      // const primaryStream = channel.streams?.[0]; 
      
      return {
        id: channel.id.toString(),
        name: channel.name,
        description: channel.description || "",
        // streamUrl: primaryStream ? (primaryStream as any).url : "", 
        streamUrl: `http://localhost:3000/streams/channel-${channel.id}/index.m3u8`,
      };
    });

    return NextResponse.json(channels, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Prisma Fetch Error:", error);
    return NextResponse.json(
      { message: "Cannot fetch channels" },
      { 
        status: 500, 
        headers: { "Access-Control-Allow-Origin": "*" } 
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}