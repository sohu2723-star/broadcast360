
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyUserToken } from "@/lib/user-jwt";

import {
  cors,
  optionsResponse,
} from "@/lib/cors";

// =====================================================
// OPTIONS
// =====================================================

export async function OPTIONS() {
  return optionsResponse();
}

// =====================================================
// AUTH
// =====================================================

async function getUserId(
  request: NextRequest
): Promise<number | null> {
  try {
    const token =
      request.cookies.get("user_token")?.value;

    if (!token) {
      return null;
    }

    const payload =
      await verifyUserToken(token);

    const userId = Number(payload.id);

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return null;
    }

    return userId;
  } catch (error) {
    console.error(
      "FAVORITE AUTH ERROR:",
      error
    );

    return null;
  }
}

// =====================================================
// INCLUDE
// =====================================================

const favoriteInclude = {
  movie: true,

  episode: {
    include: {
      series: true,
    },
  },

  entertainment: true,

  news: {
    include: {
      channel: true,
    },
  },
};

// =====================================================
// GET FAVORITES
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("user_token")?.value;

    if (!token) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message: "Unauthorized",
          },
          { status: 401 }
        )
      );
    }

    const payload = await verifyUserToken(token);
    const userId = Number(payload.id);

    if (!userId) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message: "Invalid user",
          },
          { status: 401 }
        )
      );
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        // =================================================
        // MOVIE
        // =================================================

        movie: {
          include: {
            playlistItems: {
              include: {
                playlist: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },

        // =================================================
        // EPISODE
        // =================================================

        episode: {
          include: {
            series: true,

            playlistItems: {
              include: {
                playlist: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },

        // =================================================
        // ENTERTAINMENT
        // =================================================

        entertainment: {
          include: {
            playlistItems: {
              include: {
                playlist: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },

        // =================================================
        // NEWS
        // =================================================

        news: {
          include: {
            channel: true,

            playlistItems: {
              include: {
                playlist: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });

    return cors(
      NextResponse.json({
        success: true,
        favorites,
      })
    );
  } catch (error: unknown) {
    console.error("GET FAVORITES ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to get favorites";

    return cors(
      NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 500 }
      )
    );
  }
}


// =====================================================
// POST - ADD FAVORITE
// =====================================================

export async function POST(
  request: NextRequest
) {
  try {
    const userId =
      await getUserId(request);

    if (!userId) {
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

    const body =
      await request.json();

    // =================================================
    // NORMALIZE IDS
    // =================================================

    const movieId =
      body.movieId != null
        ? Number(body.movieId)
        : null;

    const episodeId =
      body.episodeId != null
        ? Number(body.episodeId)
        : null;

    const entertainmentId =
      body.entertainmentId != null
        ? Number(body.entertainmentId)
        : null;

    const newsId =
      body.newsId != null
        ? Number(body.newsId)
        : null;

    // =================================================
    // EXACTLY ONE CONTENT ID
    // =================================================

    const ids = [
      movieId,
      episodeId,
      entertainmentId,
      newsId,
    ].filter(
      (id) =>
        id !== null &&
        Number.isInteger(id) &&
        id > 0
    );

    if (ids.length !== 1) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              "Exactly one content ID is required",
          },
          {
            status: 400,
          }
        )
      );
    }

    // =================================================
    // VERIFY CONTENT EXISTS
    // =================================================

    if (movieId !== null) {
      const movie =
        await prisma.movie.findUnique({
          where: {
            id: movieId,
          },
        });

      if (!movie) {
        return cors(
          NextResponse.json(
            {
              success: false,
              message: "Movie not found",
            },
            {
              status: 404,
            }
          )
        );
      }
    }

    if (episodeId !== null) {
      const episode =
        await prisma.episode.findUnique({
          where: {
            id: episodeId,
          },
        });

      if (!episode) {
        return cors(
          NextResponse.json(
            {
              success: false,
              message: "Episode not found",
            },
            {
              status: 404,
            }
          )
        );
      }
    }

    if (entertainmentId !== null) {
      const entertainment =
        await prisma.entertainment.findUnique({
          where: {
            id: entertainmentId,
          },
        });

      if (!entertainment) {
        return cors(
          NextResponse.json(
            {
              success: false,
              message:
                "Entertainment not found",
            },
            {
              status: 404,
            }
          )
        );
      }
    }

    if (newsId !== null) {
      const news =
        await prisma.news.findUnique({
          where: {
            id: newsId,
          },
        });

      if (!news) {
        return cors(
          NextResponse.json(
            {
              success: false,
              message: "News not found",
            },
            {
              status: 404,
            }
          )
        );
      }
    }

    // =================================================
    // CREATE FAVORITE
    // =================================================

    const favorite =
      await prisma.favorite.create({
        data: {
          userId,

          movieId,
          episodeId,
          entertainmentId,
          newsId,
        },

        include: favoriteInclude,
      });

    return cors(
      NextResponse.json(
        {
          success: true,
          message: "Added to favorites",
          favorite,
        },
        {
          status: 201,
        }
      )
    );
  } catch (error: unknown) {
    console.error(
      "POST FAVORITE ERROR:",
      error
    );

    // Prisma unique constraint
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              "This content is already in favorites",
          },
          {
            status: 409,
          }
        )
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Failed to add favorite";

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
// DELETE - REMOVE FAVORITE
// =====================================================

export async function DELETE(
  request: NextRequest
) {
  try {
    const userId =
      await getUserId(request);

    if (!userId) {
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

    const body =
      await request.json();

    const movieId =
      body.movieId != null
        ? Number(body.movieId)
        : null;

    const episodeId =
      body.episodeId != null
        ? Number(body.episodeId)
        : null;

    const entertainmentId =
      body.entertainmentId != null
        ? Number(body.entertainmentId)
        : null;

    const newsId =
      body.newsId != null
        ? Number(body.newsId)
        : null;

    const ids = [
      movieId,
      episodeId,
      entertainmentId,
      newsId,
    ].filter(
      (id) =>
        id !== null &&
        Number.isInteger(id) &&
        id > 0
    );

    if (ids.length !== 1) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              "Exactly one content ID is required",
          },
          {
            status: 400,
          }
        )
      );
    }

    // =================================================
    // FIND FAVORITE
    // =================================================

    const favorite =
      await prisma.favorite.findFirst({
        where: {
          userId,

          movieId,
          episodeId,
          entertainmentId,
          newsId,
        },
      });

    if (!favorite) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              "Favorite not found",
          },
          {
            status: 404,
          }
        )
      );
    }

    // =================================================
    // DELETE
    // =================================================

    await prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });

    return cors(
      NextResponse.json({
        success: true,
        message:
          "Removed from favorites",
      })
    );
  } catch (error: unknown) {
    console.error(
      "DELETE FAVORITE ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to remove favorite";

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
