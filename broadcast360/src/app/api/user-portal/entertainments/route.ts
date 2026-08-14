import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function mediaUrl(path: string | null | undefined) {
  if (!path) {
    return null;
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  return `http://localhost:3000${path}`;
}

export async function GET() {
  try {
    // =====================================================
    // DATE RANGE
    // =====================================================

    const now = new Date();

    const oneMonthAgo = new Date(now);

    oneMonthAgo.setMonth(
      oneMonthAgo.getMonth() - 1
    );

    console.log("DATABASE NOW:", now);
    console.log("ONE MONTH AGO:", oneMonthAgo);

    // =====================================================
    // GET COMPLETED SCHEDULES
    // =====================================================

    const schedules =
      await prisma.schedule.findMany({
        where: {
          endTime: {
            lte: now,
            gte: oneMonthAgo,
          },
        },

        include: {
          channel: true,

          playlist: {
            include: {
              items: {
                where: {
                  type: "ENTERTAINMENT",
                },

                include: {
                  entertainment: true,
                },

                orderBy: {
                  order: "asc",
                },
              },
            },
          },
        },

        /*
         * Latest schedule first.
         *
         * Therefore, when we remove duplicates below,
         * the FIRST playlist/channel combination we see
         * is the latest one.
         */
        orderBy: {
          endTime: "desc",
        },
      });

    console.log(
      "SCHEDULE COUNT:",
      schedules.length
    );

    // =====================================================
    // REMOVE DUPLICATE PLAYLISTS PER CHANNEL
    // =====================================================

    /*
     * Example:
     *
     * Channel 1 + Playlist 8
     * Channel 1 + Playlist 8
     * Channel 1 + Playlist 8
     *
     * Keep only the latest one.
     *
     * But:
     *
     * Channel 1 + Playlist 8
     * Channel 2 + Playlist 8
     *
     * These are NOT duplicates.
     */

    const seen = new Set<string>();

    // =====================================================
    // BUILD ENTERTAINMENT RESPONSE
    // =====================================================

    const entertainments = schedules
      .filter((schedule) => {
        // -------------------------------------------------
        // CHANNEL
        // -------------------------------------------------

        if (!schedule.channel) {
          return false;
        }

        // -------------------------------------------------
        // PLAYLIST
        // -------------------------------------------------

        if (!schedule.playlist) {
          return false;
        }

        // -------------------------------------------------
        // ENTERTAINMENT ITEM
        // -------------------------------------------------

        if (
          schedule.playlist.items.length === 0
        ) {
          return false;
        }

        return true;
      })

      .filter((schedule) => {
        // -------------------------------------------------
        // UNIQUE CHANNEL + PLAYLIST
        // -------------------------------------------------

        const key =
          `${schedule.channel.id}-${schedule.playlist.id}`;

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);

        return true;
      })

      .map((schedule) => {
        // =================================================
        // FIRST ENTERTAINMENT
        // =================================================

        const firstItem =
          schedule.playlist.items[0];

        const entertainment =
          firstItem?.entertainment;

        if (!entertainment) {
          return null;
        }

        // =================================================
        // RESPONSE
        // =================================================

        return {
          // ------------------------------------------------
          // ID
          // ------------------------------------------------

          /*
           * IMPORTANT:
           *
           * The playback page is:
           *
           * /entertainments/[id]
           *
           * and your entertainment API expects the
           * PLAYLIST ID.
           *
           * Therefore this must be playlist.id.
           */

          id: schedule.playlist.id,

          // ------------------------------------------------
          // PLAYLIST
          // ------------------------------------------------

          playlistId:
            schedule.playlist.id,

          playlistName:
            schedule.playlist.name,

          // ------------------------------------------------
          // ENTERTAINMENT
          // ------------------------------------------------

          title:
            entertainment.title ??
            schedule.playlist.name,

          description:
            entertainment.description ??
            null,

          category:
            entertainment.category ??
            null,

          releaseYear:
            entertainment.releaseYear ??
            null,

          thumbnail:
            mediaUrl(
              entertainment.thumbnail
            ),

          videoUrl:
            mediaUrl(
              entertainment.videoUrl
            ),

          duration:
            entertainment.duration ??
            0,

          // ------------------------------------------------
          // CHANNEL
          // ------------------------------------------------

          channelId:
            schedule.channel.id,

          channelName:
            schedule.channel.name,

          channelLogo:
            mediaUrl(
              schedule.channel.logo
            ),

          // ------------------------------------------------
          // SCHEDULE
          // ------------------------------------------------

          scheduleId:
            schedule.id,

          scheduleStart:
            schedule.startTime,

          scheduleEnd:
            schedule.endTime,
        };
      })
      .filter(
        (
          item
        ): item is NonNullable<typeof item> =>
          item !== null
      );

    // =====================================================
    // LOG
    // =====================================================

    console.log(
      "ENTERTAINMENT COUNT:",
      entertainments.length
    );

    console.log(
      "ENTERTAINMENTS:",
      entertainments.map((item) => ({
        id: item.id,
        playlistId: item.playlistId,
        channelId: item.channelId,
        title: item.title,
        scheduleId: item.scheduleId,
        scheduleEnd: item.scheduleEnd,
      }))
    );

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json(
      {
        entertainments,
      },
      {
        status: 200,

        headers: {
          "Access-Control-Allow-Origin":
            "http://localhost:3001",

          "Access-Control-Allow-Methods":
            "GET, OPTIONS",

          "Access-Control-Allow-Headers":
            "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error(
      "USER ENTERTAINMENT API ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to fetch entertainments",
      },
      {
        status: 500,
      }
    );
  }
}