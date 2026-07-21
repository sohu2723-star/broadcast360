import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export const ScheduleRepository = {
  findAll: async () => {
    return prisma.schedule.findMany({
      include: { channel: true, playlist: true },
      orderBy: { startTime: "asc" },
    });
  },

  findById: async (id: number) => {
  return prisma.schedule.findUnique({
    where: { id },
    include: {
      channel: true,
      playlist: {
        include: {
          items: {
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
},

  findByChannel: async (channelId: number) => {
    return prisma.schedule.findMany({
      where: { channelId },
    });
  },

  getPaginatedSchedules: async ({
    page,
    limit,
    search,
    date,
  }: {
    page: number;
    limit: number;
    search?: string;
    date?: string;
  }) => {
    const skip = (page - 1) * limit;
    const start = date ? new Date(`${date}T00:00:00`) : undefined;
    const end = date ? new Date(`${date}T23:59:59.999`) : undefined;

    const where: Prisma.ScheduleWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { channel: { name: { contains: search, mode: "insensitive" } } },
                { playlist: { name: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {},
        date
          ? {
              OR: [
                { startTime: { gte: start, lte: end } },
                { endTime: { gte: start, lte: end } },
              ],
            }
          : {},
      ],
    };

    const [data, total] = await prisma.$transaction([
      prisma.schedule.findMany({
        where,
        skip,
        take: limit,
        include: { channel: true, playlist: true },
        orderBy: { startTime: "desc" },
      }),
      prisma.schedule.count({ where }),
    ]);

    return { data, total };
  },

  create: async (data: {
    channelId: number;
    playlistId: number;
    startTime: Date;
    endTime: Date | null;
  }) => {
    return prisma.schedule.create({
      data,
      include: { channel: true, playlist: true },
    });
  },

  update: async (
    id: number,
    data: {
      channelId: number;
      playlistId: number;
      startTime: Date;
      endTime: Date | null;
    }
  ) => {
    return prisma.schedule.update({
      where: { id },
      data,
      include: { channel: true, playlist: true },
    });
  },

  delete: async (id: number) => {
    if (!id || isNaN(id)) throw new Error("Invalid schedule id");
    return prisma.schedule.delete({
      where: { id },
    });
  },

/**
 * Get schedules around current time
 */
  getSchedulesAroundTime: async (now: Date) => {
  return prisma.schedule.findMany({
    where: {
      startTime: {
        lte: new Date(now.getTime() + 60 * 60 * 1000),
      },
    },
    include: {
      playlist: {
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
},

  findLiveSchedule: async (
  channelId: number,
  now: Date
) => {

  console.log("🔎 Checking schedule", {
    channelId,
    now: now.toISOString(),
  });


  const schedule = await prisma.schedule.findFirst({

    where: {

      channelId,


      // only active schedules
      status: {
        in: [
          "SCHEDULED",
          "LIVE",
        ],
      },


      // schedule already started
      startTime: {
        lte: now,
      },


      // schedule not finished
      OR: [
        {
          endTime: null,
        },
        {
          endTime: {
            gt: now,
          },
        },
      ],
    },


    orderBy: {
      startTime: "desc",
    },


    include: {

      playlist: {

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



  console.log(
    "📅 Schedule result:",
    schedule
      ? {
          id: schedule.id,
          status: schedule.status,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          playlist: schedule.playlist?.name,
        }
      : null
  );


  return schedule;

},

findNextSchedule: async (
  channelId: number,
  now: Date,
) => {
  return prisma.schedule.findFirst({
    where: {
      channelId,

      status: {
        in: ["SCHEDULED", "LIVE"],
      },

      startTime: {
        gt: now,
      },
    },

    orderBy: {
      startTime: "asc",
    },

    include: {
      playlist: {
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
},


  updateStatus: async (
    id: number,
    status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED"
  ) => {
    return prisma.schedule.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  },


};
