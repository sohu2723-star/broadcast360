import { prisma } from "@/lib/prisma";
import crypto from "crypto";

type CreateChannelInput = {
  name: string;
  description?: string;
  logo?: string;
  country?: string;
};

type UpdateChannelInput = {
  name?: string;
  description?: string;
  logo?: string;
  country?: string;
};

function generateStreamKey() {
  return crypto.randomBytes(16).toString("hex");
}

export function getAllChannels() {
  return prisma.channel.findMany();
}

// pagination query
export async function getPaginatedChannels({
  page,
  limit,
  search,
}: {
  page: number;
  limit: number;
  search?: string;
}) {
  const skip = (page - 1) * limit;

  const whereClause = search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            country: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};

  const [data, total] = await prisma.$transaction([
    prisma.channel.findMany({
      where: whereClause,

      include: {
        streams: true,
      },

      skip,

      take: limit,

      orderBy: {
        id: "desc",
      },
    }),

    prisma.channel.count({
      where: whereClause,
    }),
  ]);

  return {
    data,
    total,
  };
}

export function getChannelById(id: number) {
  return prisma.channel.findUnique({
    where: {
      id,
    },

    include: {
      streams: true,

      programs: true,

      news: true,

      recordings: true,
    },
  });
}

// CREATE CHANNEL
// generate stream key automatically
export function createChannel(data: CreateChannelInput) {
  return prisma.channel.create({
    data: {
      ...data,

      streamKey: generateStreamKey(),
    },
  });
}

export function updateChannel(id: number, data: UpdateChannelInput) {
  return prisma.channel.update({
    where: {
      id,
    },

    data,
  });
}

// ================================
// LIVE STREAM HELPERS
// ================================

// Get active stream of channel
export function getChannelStream(channelId: number) {
  return prisma.stream.findFirst({
    where: {
      channelId,
    },

    include: {
      channel: true,
    },
  });
}

// Validate OBS / Larix stream key
export async function findChannelByStreamKey(streamKey: string) {
  return prisma.channel.findUnique({
    where: {
      streamKey,
    },

    include: {
      streams: true,
    },
  });
}

export async function deleteChannel(id: number) {
  return prisma.$transaction([
    prisma.stream.deleteMany({
      where: {
        channelId: id,
      },
    }),

    prisma.playlistItem.deleteMany({
      where: {
        playlist: {
          program: {
            channelId: id,
          },
        },
      },
    }),

    prisma.schedule.deleteMany({
      where: {
        channelId: id,
      },
    }),

    prisma.playlist.deleteMany({
      where: {
        program: {
          channelId: id,
        },
      },
    }),

    prisma.program.deleteMany({
      where: {
        channelId: id,
      },
    }),

    prisma.news.deleteMany({
      where: {
        channelId: id,
      },
    }),

    prisma.recording.deleteMany({
      where: {
        channelId: id,
      },
    }),

    prisma.broadcastSession.deleteMany({
      where: {
        channelId: id,
      },
    }),

    prisma.channel.delete({
      where: {
        id,
      },
    }),
  ]);
}

export async function getDefaultPlaylist(channelId: number) {
  return prisma.channel.findUnique({
    where: {
      id: channelId,
    },

    include: {
      defaultPlaylist: {
        include: {
          items: {
            orderBy: {
              order: "asc",
            },

            include: {
              movie: true,

              episode: true,

              advertisement: true,

              entertainment: true,

              news: true,

              stream: true,
            },
          },
        },
      },
    },
  });
}

// ================================
// BROADCAST HELPERS
// ================================

export function getChannelBroadcastInfo(channelId: number) {
  return prisma.channel.findUnique({
    where: {
      id: channelId,
    },

    select: {
      id: true,
      name: true,
      streamKey: true,
    },
  });
}
