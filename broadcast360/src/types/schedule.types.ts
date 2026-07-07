import { Prisma } from "@/generated/prisma/client";

export type ScheduleWithRelations = Prisma.ScheduleGetPayload<{
  include: {
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

export type PlaylistItemWithRelations =
  ScheduleWithRelations["playlist"]["items"][number];