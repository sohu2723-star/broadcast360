import { prisma } from "@/lib/prisma";
import {
  StreamProtocol,
  StreamStatus,
} from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";

/**
 * ==========================================================
 * NORMALIZE EXTERNAL LIVE STREAM URL
 * ==========================================================
 *
 * User may enter:
 *
 * rtmp://192.168.1.100:1935/bc360_kids_key
 *
 * We store:
 *
 * rtmp://192.168.1.100:1935/live/bc360_kids_key
 *
 * This is the INPUT path used by Larix / OBS.
 *
 * IMPORTANT:
 *
 * source/{streamKey}
 * channel/{streamKey}
 *
 * are internal MediaMTX paths and should NOT be stored
 * as the external stream URL.
 */
function normalizeRtmpUrl(url: string): string {
  const trimmed = url.trim();

  if (!trimmed) {
    throw new Error("Stream URL is required");
  }

  const parsed = new URL(trimmed);

  if (parsed.protocol !== "rtmp:") {
    throw new Error(
      `Invalid RTMP protocol: ${parsed.protocol}`
    );
  }

  const parts = parsed.pathname
    .split("/")
    .filter(Boolean);

  if (parts.length === 0) {
    throw new Error(
      `Invalid RTMP stream URL: ${url}`
    );
  }

  /*
   * Already normalized:
   *
   * rtmp://host:1935/live/key
   */
  if (
    parts.length >= 2 &&
    parts[0] === "live"
  ) {
    const streamKey = parts[1];

    if (!streamKey) {
      throw new Error(
        `Missing RTMP stream key: ${url}`
      );
    }

    return `${parsed.protocol}//${parsed.host}/live/${streamKey}`;
  }

  /*
   * Old/simple format:
   *
   * rtmp://host:1935/key
   *
   * Convert to:
   *
   * rtmp://host:1935/live/key
   */
  const streamKey =
    parts[parts.length - 1];

  if (!streamKey) {
    throw new Error(
      `Missing RTMP stream key: ${url}`
    );
  }

  return `${parsed.protocol}//${parsed.host}/live/${streamKey}`;
}

/**
 * ==========================================================
 * STREAM REPOSITORY
 * ==========================================================
 */
export const StreamRepository = {
  /**
   * ========================================================
   * FIND ALL
   * ========================================================
   */
  async findAllPaginated({
    page,
    limit,
    search,
  }: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const skip = (page - 1) * limit;

    const where: Prisma.StreamWhereInput =
      search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                url: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                channel: {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : {};

    const [data, total] =
      await prisma.$transaction([
        prisma.stream.findMany({
          where,

          include: {
            channel: true,
          },

          orderBy: {
            createdAt: "desc",
          },

          skip,

          take: limit,
        }),

        prisma.stream.count({
          where,
        }),
      ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(
        total / limit
      ),
    };
  },

  /**
   * ========================================================
   * FIND BY ID
   * ========================================================
   */
  async findById(id: number) {
    return prisma.stream.findUnique({
      where: {
        id,
      },

      include: {
        channel: true,
      },
    });
  },

  /**
   * ========================================================
   * FIND BY CHANNEL
   * ========================================================
   */
  async findByChannel(channelId: number) {
    return prisma.stream.findMany({
      where: {
        channelId,
      },

      include: {
        channel: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * ========================================================
   * CREATE
   * ========================================================
   */
  async create(data: {
    channelId: number;
    name: string;
    url: string;
    protocol: StreamProtocol;
    description?: string | null;
  }) {
    let url = data.url;

    /*
     * RTMP = external LIVE input
     *
     * Example:
     *
     * Input:
     * rtmp://192.168.1.100:1935/key
     *
     * Stored:
     * rtmp://192.168.1.100:1935/live/key
     */
    if (
      data.protocol === StreamProtocol.RTMP
    ) {
      url = normalizeRtmpUrl(
        data.url
      );
    }

    return prisma.stream.create({
      data: {
        channelId: data.channelId,
        name: data.name,
        url,
        protocol: data.protocol,
        description:
          data.description ?? null,
      },

      include: {
        channel: true,
      },
    });
  },

  /**
   * ========================================================
   * UPDATE
   * ========================================================
   */
  async update(
    id: number,
    data: {
      channelId?: number;
      name?: string;
      url?: string;
      protocol?: StreamProtocol;
      status?: StreamStatus;
      description?: string | null;
    }
  ) {
    let url = data.url;

    /*
     * Only normalize when an RTMP URL
     * is being supplied.
     *
     * If protocol is omitted during update,
     * get the existing record's protocol.
     */
    let protocol = data.protocol;

    if (!protocol && url) {
      const existing =
        await prisma.stream.findUnique({
          where: {
            id,
          },

          select: {
            protocol: true,
          },
        });

      protocol =
        existing?.protocol;
    }

    if (
      url &&
      protocol === StreamProtocol.RTMP
    ) {
      url = normalizeRtmpUrl(url);
    }

    return prisma.stream.update({
      where: {
        id,
      },

      data: {
        ...(data.channelId !== undefined && {
          channelId:
            data.channelId,
        }),

        ...(data.name !== undefined && {
          name: data.name,
        }),

        ...(url !== undefined && {
          url,
        }),

        ...(data.protocol !== undefined && {
          protocol:
            data.protocol,
        }),

        ...(data.status !== undefined && {
          status:
            data.status,
        }),

        ...(data.description !== undefined && {
          description:
            data.description,
        }),
      },

      include: {
        channel: true,
      },
    });
  },

  /**
   * ========================================================
   * DELETE
   * ========================================================
   */
  async delete(id: number) {
    return prisma.stream.delete({
      where: {
        id,
      },
    });
  },
};