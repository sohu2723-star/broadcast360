import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function mediaUrl(value: string | null | undefined) {
  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  return `http://localhost:3000${
    value.startsWith("/") ? value : `/${value}`
  }`;
}

export async function GET() {
  try {
    const now = new Date();

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // =====================================================
    // GET COMPLETED SCHEDULES
    // =====================================================

    const schedules = await prisma.schedule.findMany({
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
                type: "MOVIE",
              },

              include: {
                movie: true,
              },

              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },

      // Latest schedule first
      orderBy: {
        endTime: "desc",
      },
    });

    // =====================================================
    // REMOVE DUPLICATE PLAYLIST + CHANNEL
    // =====================================================

    const seen = new Set<string>();

    const movies = schedules
      .filter((schedule) => {
        // No channel
        if (!schedule.channel) {
          return false;
        }

        // No playlist
        if (!schedule.playlist) {
          return false;
        }

        // Playlist has no movie
        if (schedule.playlist.items.length === 0) {
          return false;
        }

        return true;
      })

      .filter((schedule) => {
        const channelId = schedule.channel.id;
        const playlistId = schedule.playlist.id;

        /*
         * Same playlist on same channel = duplicate.
         *
         * Example:
         *
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
         * are different and both are kept.
         */

        const key = `${channelId}-${playlistId}`;

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);

        return true;
      })

      // ===================================================
      // CREATE RESPONSE
      // ===================================================

      .map((schedule) => {
        const playlist = schedule.playlist;

        const firstItem = playlist.items[0];

        const movie = firstItem?.movie;

        return {
          // =================================================
          // UNIQUE FRONTEND ID
          // =================================================

          /*
           * DO NOT use movie.id here.
           *
           * A movie can appear in multiple playlists/channels.
           *
           * Channel + Playlist makes this unique.
           */

          id: `${schedule.channel.id}-${playlist.id}`,

          /*
           * Keep a separate key as well.
           */

          movieKey: `${schedule.channel.id}-${playlist.id}`,

          // =================================================
          // PLAYLIST
          // =================================================

          playlistId: playlist.id,

          playlistName: playlist.name,

          // =================================================
          // MOVIE
          // =================================================

          title:
            movie?.title ??
            playlist.name,

          description:
            movie?.description ?? null,

          genre:
            movie?.genre ?? "Movie",

          releaseYear:
            movie?.releaseYear ?? null,

          duration:
            movie?.duration ?? 0,

          thumbnail:
            mediaUrl(movie?.thumbnail),

          videoUrl:
            mediaUrl(movie?.videoUrl),

          // =================================================
          // CHANNEL
          // =================================================

          channelId:
            schedule.channel.id,

          channelName:
            schedule.channel.name,

          channelLogo:
            mediaUrl(schedule.channel.logo),

          // =================================================
          // SCHEDULE
          // =================================================

          scheduleId:
            schedule.id,

          scheduleStart:
            schedule.startTime,

          scheduleEnd:
            schedule.endTime,
        };
      });

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json(
      {
        movies,
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
      },
    );
  } catch (error) {
    console.error(
      "MOVIE API ERROR:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Failed to fetch movies",
      },
      {
        status: 500,
      },
    );
  }
}