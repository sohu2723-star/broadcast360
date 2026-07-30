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

/*
====================================
 DATABASE PLAYLIST ITEM
====================================
*/

export type PlaylistItemWithRelations = Prisma.PlaylistItemGetPayload<{
  include: {
    movie: true;

    episode: true;

    advertisement: true;

    entertainment: true;

    news: true;

    stream: true;
  };
}>;

/*
====================================
 PLAYOUT ITEM
====================================

This is what FFmpeg uses.

Database -> Resolver -> PlayoutManager

====================================
*/

export interface ResolvedPlaylistItem {
  id: number;

  type:
    | "MOVIE"
    | "EPISODE"
    | "ADVERTISEMENT"
    | "ENTERTAINMENT"
    | "NEWS"
    | "STREAM";

  videoUrl?: string;

  streamUrl?: string;

  duration?: number | null;

  order: number;
}
