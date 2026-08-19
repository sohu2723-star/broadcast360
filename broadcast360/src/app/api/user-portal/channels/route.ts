import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cors, optionsResponse } from "@/lib/cors";

export async function GET(req: Request) {
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
          ? `${(process.env.MEDIAMTX_PUBLIC_URL || "http://localhost:8888").replace(/\/$/, "")}/channel/${channel.streamKey}/index.m3u8`
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

    return cors(
      NextResponse.json(channels, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
        },
      }),
    );
  } catch (error) {
    console.error("PUBLIC CHANNEL API ERROR:", error);

    return cors(
      NextResponse.json(
        { message: "Cannot fetch channels" },
        { status: 500 },
      ),
    );
  }
}

export function OPTIONS() {
  return optionsResponse();
}