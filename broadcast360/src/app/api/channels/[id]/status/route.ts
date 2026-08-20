import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MEDIAMTX_API = "http://127.0.0.1:9997";

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    /*
     * ==========================================================
     * GET ROUTE PARAM
     * ==========================================================
     */

    const params = await context.params;

    console.log("🔎 Route params:", params);

    const channelId = params.id;

    console.log(
      "🔎 Checking channel status:",
      channelId
    );

    const id = Number(channelId);

    console.log(
      "🔢 Parsed channel ID:",
      id
    );

    if (!Number.isInteger(id) || id <= 0) {
      console.error(
        " Invalid channel ID:",
        channelId
      );

      return NextResponse.json(
        {
          error: "Invalid channel ID",
          channelId,
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ==========================================================
     * GET CHANNEL
     * ==========================================================
     */

    const channel =
      await prisma.channel.findUnique({
        where: {
          id,
        },
      });

    if (!channel) {
      console.error(
        ` Channel ${id} not found`
      );

      return NextResponse.json(
        {
          error: "Channel not found",
        },
        {
          status: 404,
        }
      );
    }

    console.log(
      " Channel:",
      channel.name
    );

    console.log(
      "🔑 Stream key:",
      channel.streamKey
    );

    /*
     * ==========================================================
     * GET MEDIAMTX PATHS
     * ==========================================================
     */

    const mediaResponse = await fetch(
      `${MEDIAMTX_API}/v3/paths/list`,
      {
        cache: "no-store",
      }
    );

    if (!mediaResponse.ok) {
      throw new Error(
        `MediaMTX API returned ${mediaResponse.status}`
      );
    }

    const mediaMtx =
      await mediaResponse.json();

    const paths =
      mediaMtx.items ?? [];

    /*
     * ==========================================================
     * CHANNEL OUTPUT
     * ==========================================================
     *
     * channel/bc360_kids_key
     *
     * This is your final TV output.
     *
     * If this is online:
     *
     * VOD is running OR LIVE is running.
     */

    const channelPathName =
      `channel/${channel.streamKey}`;

    const channelPath =
      paths.find(
        (item: any) =>
          item.name === channelPathName
      );

    /*
     * ==========================================================
     * LIVE SOURCE
     * ==========================================================
     *
     * source/bc360_kids_key
     *
     * This represents an actual incoming
     * RTMP/RTSP live source.
     */

    const sourcePathName =
      `source/${channel.streamKey}`;

    const sourcePath =
      paths.find(
        (item: any) =>
          item.name === sourcePathName
      );

    /*
     * ==========================================================
     * STATUS
     * ==========================================================
     *
     * LIVE:
     * source online
     *
     * VOD:
     * channel output online
     * but source offline
     *
     * OFFLINE:
     * channel output offline/not available
     */

    const sourceOnline =
      sourcePath?.online === true;

    const channelOnline =
      channelPath?.online === true;

    let status:
      | "live"
      | "vod"
      | "offline";

    if (sourceOnline) {
      status = "live";
    } else if (channelOnline) {
      status = "vod";
    } else {
      status = "offline";
    }

    const isLive =
      status === "live";

    /*
     * ==========================================================
     * DEBUG
     * ==========================================================
     */

    console.log(
      ` ${channel.name} status:`,
      {
        status,

        channelPath:
          channelPath?.name ?? null,

        channelOnline,

        sourcePath:
          sourcePath?.name ?? null,

        sourceOnline,

        sourceType:
          sourcePath?.source?.type ?? null,

        isLive,
      }
    );

    /*
     * ==========================================================
     * RESPONSE
     * ==========================================================
     */

    return NextResponse.json({
      channelId: channel.id,

      channelName:
        channel.name,

      streamKey:
        channel.streamKey,

      /*
       * FINAL STATUS
       *
       * Frontend uses this.
       */
      status,

      /*
       * TV output
       */
      channelPath:
        channelPath?.name ?? null,

      channelOnline,

      /*
       * Actual live input
       */
      sourcePath:
        sourcePath?.name ?? null,

      sourceOnline,

      sourceType:
        sourcePath?.source?.type ?? null,

      /*
       * true ONLY when actual
       * live source is connected.
       */
      isLive,
    });
  } catch (error) {
    console.error(
      " Channel status error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to check channel status",

        status: "offline",

        isLive: false,
      },
      {
        status: 500,
      }
    );
  }
}