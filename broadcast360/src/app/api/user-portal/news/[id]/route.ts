import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { cors, optionsResponse } from "@/lib/cors";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  try {
    const { id } = await params;

    const newsId = Number(id);

    if (!Number.isInteger(newsId)) {
      return cors(
        NextResponse.json(
          {
            message: "Invalid news ID",
          },
          {
            status: 400,
          }
        )
      );
    }

    const news = await prisma.news.findUnique({
      where: {
        id: newsId,
      },

      include: {
        channel: true,

        recording: true,

        playlistItems: {
          include: {
            playlist: {
              include: {
                program: true,
              },
            },
          },
        },
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

    return cors(
      NextResponse.json({
        success: true,
        news,
      })
    );
  } catch (error: unknown) {
    console.error("GET NEWS BY ID ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to get news";

    return cors(
      NextResponse.json(
        {
          message,
        },
        {
          status: 500,
        }
      )
    );
  }
}