type Prisma = any;


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

export type PlaylistItemWithRelations = any;

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

  title?: string;

  streamUrl?: string;

  streamName?: string;

  duration?: number | null;

  order: number;
}
