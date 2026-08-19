import { NextRequest, NextResponse } from "next/server";

import { verifyUserToken } from "@/lib/user-jwt";
import { prisma } from "@/lib/prisma";

import { cors, optionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

// =====================================================
// GET WATCH HISTORY
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("user_token")?.value;

    if (!token) {
      return cors(
        NextResponse.json(
          {
            message: "Unauthorized",
          },
          {
            status: 401,
          }
        )
      );
    }

    const payload = await verifyUserToken(token);
    const userId = Number(payload.id);

    const history = await prisma.watchHistory.findMany({
      where: {
        userId,
      },

      orderBy: {
        watchedAt: "desc",
      },

      include: {
        playlistItem: {
          include: {
            // IMPORTANT
            playlist: true,

            movie: true,

            episode: {
              include: {
                series: true,
              },
            },

            entertainment: true,
          },
        },

        news: true,
      },
    });

    return cors(
      NextResponse.json({
        success: true,
        history,
      })
    );
  } catch (error: unknown) {
    console.error("GET WATCH HISTORY ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to get watch history";

    return cors(
      NextResponse.json(
        {
          success: false,
          message,
        },
        {
          status: 500,
        }
      )
    );
  }
}
// =====================================================
// SAVE / UPDATE WATCH HISTORY
// =====================================================

export async function POST(request: NextRequest) {
  try {
    // =================================================
    // AUTHENTICATION
    // =================================================

    const token = request.cookies.get("user_token")?.value;

    if (!token) {
      return cors(
        NextResponse.json(
          {
            message: "Unauthorized",
          },
          {
            status: 401,
          }
        )
      );
    }

    const payload = await verifyUserToken(token);
    const userId = Number(payload.id);

    // =================================================
    // REQUEST BODY
    // =================================================

    const body = await request.json();

    // =================================================
    // CONTENT IDS
    // =================================================

    const movieId =
      body.movieId !== undefined &&
      body.movieId !== null
        ? Number(body.movieId)
        : null;

    const episodeId =
      body.episodeId !== undefined &&
      body.episodeId !== null
        ? Number(body.episodeId)
        : null;

    const newsId =
      body.newsId !== undefined &&
      body.newsId !== null
        ? Number(body.newsId)
        : null;

    const entertainmentId =
      body.entertainmentId !== undefined &&
      body.entertainmentId !== null
        ? Number(body.entertainmentId)
        : null;

    // =================================================
    // PROGRESS
    // =================================================

    const progressSeconds = Number(
      body.progressSeconds ?? 0
    );

    const durationSeconds =
      body.durationSeconds !== undefined &&
      body.durationSeconds !== null
        ? Number(body.durationSeconds)
        : null;

    // =================================================
    // VALIDATE NUMBERS
    // =================================================

    if (
      !Number.isFinite(progressSeconds) ||
      progressSeconds < 0
    ) {
      return cors(
        NextResponse.json(
          {
            message: "Invalid progressSeconds",
          },
          {
            status: 400,
          }
        )
      );
    }

    if (
      durationSeconds !== null &&
      (!Number.isFinite(durationSeconds) ||
        durationSeconds <= 0)
    ) {
      return cors(
        NextResponse.json(
          {
            message: "Invalid durationSeconds",
          },
          {
            status: 400,
          }
        )
      );
    }

    // =================================================
    // EXACTLY ONE CONTENT TYPE
    // =================================================

    const contentIds = [
      movieId,
      episodeId,
      newsId,
      entertainmentId,
    ].filter(
      (id) =>
        id !== null &&
        Number.isInteger(id) &&
        id > 0
    );

    if (contentIds.length !== 1) {
      return cors(
        NextResponse.json(
          {
            message:
              "Provide exactly one of movieId, episodeId, newsId, or entertainmentId",
          },
          {
            status: 400,
          }
        )
      );
    }

    // =================================================
    // NEWS
    // =================================================
    //
    // IMPORTANT:
    // News is independent from PlaylistItem.
    //
    // We directly find the News record and save
    // WatchHistory.newsId.
    //
    // =================================================

    if (newsId !== null) {
      const news = await prisma.news.findUnique({
        where: {
          id: newsId,
        },
      });

      if (!news) {
        return cors(
          NextResponse.json(
            {
              message: "News not found",
            },
            {
              status: 404,
            }
          )
        );
      }

      const history =
        await prisma.watchHistory.upsert({
          where: {
            userId_newsId: {
              userId,
              newsId,
            },
          },

          create: {
            userId,
            newsId,

            progressSeconds: Math.floor(
              progressSeconds
            ),

            durationSeconds:
              durationSeconds !== null
                ? Math.floor(durationSeconds)
                : news.duration,

            watchedAt: new Date(),
          },

          update: {
            progressSeconds: Math.floor(
              progressSeconds
            ),

            durationSeconds:
              durationSeconds !== null
                ? Math.floor(durationSeconds)
                : news.duration,

            watchedAt: new Date(),
          },

          include: {
            news: true,
          },
        });

      console.log(
        "NEWS WATCH HISTORY SAVED:",
        {
          userId,
          newsId,
          progressSeconds,
          durationSeconds,
        }
      );

      return cors(
        NextResponse.json({
          success: true,
          history,
        })
      );
    }

    // =================================================
    // MOVIE / EPISODE / ENTERTAINMENT
    // =================================================
    //
    // These continue using PlaylistItem.
    //
    // =================================================

    const conditions = [];

    if (movieId !== null) {
      conditions.push({
        movieId,
      });
    }

    if (episodeId !== null) {
      conditions.push({
        episodeId,
      });
    }

    if (entertainmentId !== null) {
      conditions.push({
        entertainmentId,
      });
    }

    const playlistItem =
      await prisma.playlistItem.findFirst({
        where: {
          OR: conditions,
        },
      });

    if (!playlistItem) {
      return cors(
        NextResponse.json(
          {
            message:
              "Playlist item for this content was not found",
          },
          {
            status: 404,
          }
        )
      );
    }

    // =================================================
    // SAVE MOVIE / EPISODE / ENTERTAINMENT HISTORY
    // =================================================

    const history =
      await prisma.watchHistory.upsert({
        where: {
          userId_playlistItemId: {
            userId,
            playlistItemId: playlistItem.id,
          },
        },

        create: {
          userId,
          playlistItemId: playlistItem.id,

          progressSeconds: Math.floor(
            progressSeconds
          ),

          durationSeconds:
            durationSeconds !== null
              ? Math.floor(durationSeconds)
              : null,

          watchedAt: new Date(),
        },

        update: {
          progressSeconds: Math.floor(
            progressSeconds
          ),

          durationSeconds:
            durationSeconds !== null
              ? Math.floor(durationSeconds)
              : null,

          watchedAt: new Date(),
        },

        include: {
          playlistItem: {
            include: {
              movie: true,

              episode: {
                include: {
                  series: true,
                },
              },

              entertainment: true,
            },
          },
        },
      });

    console.log(
      "WATCH HISTORY SAVED:",
      {
        userId,
        playlistItemId: playlistItem.id,
        progressSeconds,
        durationSeconds,
      }
    );

    return cors(
      NextResponse.json({
        success: true,
        history,
      })
    );
  } catch (error: unknown) {
    console.error(
      "SAVE WATCH HISTORY ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to save watch history";

    return cors(
      NextResponse.json(
        {
          success: false,
          message,
        },
        {
          status: 500,
        }
      )
    );
  }
}

// =====================================================
// DELETE ALL WATCH HISTORY
// =====================================================

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("user_token")?.value;

    if (!token) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message: "Unauthorized",
          },
          {
            status: 401,
          }
        )
      );
    }

    const payload = await verifyUserToken(token);
    const userId = Number(payload.id);

    // Delete ONLY this user's history
    const result = await prisma.watchHistory.deleteMany({
      where: {
        userId,
      },
    });

    console.log("ALL WATCH HISTORY CLEARED:", {
      userId,
      deletedCount: result.count,
    });

    return cors(
      NextResponse.json({
        success: true,
        message: "Watch history cleared successfully",
        deletedCount: result.count,
      })
    );
  } catch (error: unknown) {
    console.error("CLEAR WATCH HISTORY ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to clear watch history";

    return cors(
      NextResponse.json(
        {
          success: false,
          message,
        },
        {
          status: 500,
        }
      )
    );
  }
}