import { Prisma } from "@/generated/prisma/client";

export type ScheduleWithRelations = Prisma.ScheduleGetPayload<{
  include: {
  channel: true,
  playlist: {
    include: {
      items: {
        orderBy: { order: "asc" },
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
}
}>;