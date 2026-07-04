import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function deleteSchedule(id: number) {
  if (!id || isNaN(id)) {
    throw new Error("Invalid schedule id");
  }

  return prisma.schedule.delete({
    where: { id },
  });
}

// GET BY ID
export function getScheduleById(id: number) {
  return prisma.schedule.findUnique({
    where: { id },
    include: {
      channel: true,
      playlist: true,
    },
  });
}

// PAGINATION + SEARCH + SINGLE DATE FILTER
export async function getPaginatedSchedules({
  page,
  limit,
  search,
  date,
}: {
  page: number;
  limit: number;
  search?: string;
  date?: string;
}) {
  const skip = (page - 1) * limit;

  const start = date ? new Date(`${date}T00:00:00`) : undefined;
  const end = date ? new Date(`${date}T23:59:59.999`) : undefined;

  const where: Prisma.ScheduleWhereInput = {
    AND: [
      search
        ? {
            OR: [
              {
                channel: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
              {
                playlist: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
            ],
          }
        : {},

      date
        ? {
            OR: [
              {
                startTime: {
                  gte: start,
                  lte: end,
                },
              },
              {
                endTime: {
                  gte: start,
                  lte: end,
                },
              },
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
      include: {
        channel: true,
        playlist: true,
      },
      orderBy: {
        startTime: "desc",
      },
    }),

    prisma.schedule.count({ where }),
  ]);

  return { data, total };
}