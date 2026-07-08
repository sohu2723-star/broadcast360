import { Prisma } from "@/generated/prisma/client";

export interface Playlist {
  id: number;
  name: string;
  programId: number;
  totalDuration?: number;
  createdAt: string;
}

export interface PlaylistCreateInput {
  name: string;
}

export type PlaylistItemWithRelations =
  Prisma.PlaylistItemGetPayload<{
    include: {
      movie: true;
      episode: true;
      advertisement: true;
      entertainment: true;
      news: true;
      stream: true;
    };
  }>;