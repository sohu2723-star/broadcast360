import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isUserPremium } from "@/services/subscription.service";
import { verifyUserToken } from "@/lib/user-jwt";
import { getPortalCorsHeaders } from "@/lib/portal-cors";



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
    const corsHeaders = getPortalCorsHeaders(request);
    const { id } = await params;

    const channelId = Number(id);

    if (
      !Number.isInteger(channelId) ||
      channelId <= 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid channel id",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    /*
     * ==========================================
     * FIND CHANNEL
     * ==========================================
     */

    const channel =
      await prisma.channel.findUnique({
        where: {
          id: channelId,
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

    /*
     * ==========================================
     * FREE CHANNEL
     * ==========================================
     *
     * FREE channels are always allowed.
     */

    if (channel.accessType === "FREE") {
      return NextResponse.json(
        {
          allowed: true,

          id: channel.id.toString(),

          name: channel.name,

          description:
            channel.description ?? "",

          logo: channel.logo,

          country: channel.country,

          accessType: channel.accessType,

          playbackUrl: channel.streamKey
            ? `http://localhost:8888/channel/${channel.streamKey}/index.m3u8`
            : null,

          streamKey: channel.streamKey,

          streams: channel.streams.map(
            (stream) => ({
              id: stream.id,
              url: stream.url,
            }),
          ),
        },
        {
          status: 200,
          headers: corsHeaders,
        },
      );
    }

    /*
     * ==========================================
     * PREMIUM CHANNEL
     * ==========================================
     */

    if (channel.accessType === "PREMIUM") {
      /*
       * IMPORTANT:
       *
       * Use the same cookie as the rest
       * of your user portal authentication.
       */

      const cookieHeader =
        request.headers.get("cookie");

      let token: string | null = null;

      if (cookieHeader) {
        const tokenMatch = cookieHeader
          .split(";")
          .map((cookie) =>
            cookie.trim(),
          )
          .find((cookie) =>
            cookie.startsWith(
              "user_token=",
            ),
          );

        if (tokenMatch) {
          token =
            tokenMatch.substring(
              "user_token=".length,
            );
        }
      }

      /*
       * ========================================
       * NOT LOGGED IN
       * ========================================
       */

      if (!token) {
        return NextResponse.json(
          {
            allowed: false,

            accessType: "PREMIUM",

            message:
              "Please login to watch this premium channel.",
          },
          {
            status: 401,
            headers: corsHeaders,
          },
        );
      }

      /*
       * ========================================
       * VERIFY USER
       * ========================================
       */

      let userId: number;

      try {
        const payload =
          await verifyUserToken(token);

        userId = Number(payload.id);

        if (
          !Number.isInteger(userId) ||
          userId <= 0
        ) {
          throw new Error(
            "Invalid user",
          );
        }
      } catch (error) {
        console.error(
          "USER TOKEN VERIFICATION FAILED:",
          error,
        );

        return NextResponse.json(
          {
            allowed: false,

            accessType: "PREMIUM",

            message:
              "Please login again to watch this channel.",
          },
          {
            status: 401,
            headers: corsHeaders,
          },
        );
      }

      /*
       * ========================================
       * CHECK PREMIUM
       * ========================================
       */

      const premium =
        await isUserPremium(userId);

      if (!premium) {
        return NextResponse.json(
          {
            allowed: false,

            accessType: "PREMIUM",

            message:
              "Premium subscription required to watch this channel.",
          },
          {
            status: 403,
            headers: corsHeaders,
          },
        );
      }
    }

    /*
     * ==========================================
     * ACCESS GRANTED
     * ==========================================
     */

    return NextResponse.json(
      {
        allowed: true,

        id: channel.id.toString(),

        name: channel.name,

        description:
          channel.description ?? "",

        logo: channel.logo,

        country: channel.country,

        accessType:
          channel.accessType,

        playbackUrl: channel.streamKey
          ? `http://localhost:8888/channel/${channel.streamKey}/index.m3u8`
          : null,

        streamKey: channel.streamKey,

        streams: channel.streams.map(
          (stream) => ({
            id: stream.id,
            url: stream.url,
          }),
        ),
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error(
      "CHANNEL ACCESS API ERROR:",
      error,
    );

    return NextResponse.json(
      {
        allowed: false,
        message:
          "Cannot access this channel",
      },
      {
        status: 500,
        headers: getPortalCorsHeaders(request),
      },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: getPortalCorsHeaders(),
  });
}