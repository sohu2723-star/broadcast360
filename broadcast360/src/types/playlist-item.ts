export type PlaylistItemType =
  | "MOVIE"
  | "SERIES"
  | "ADVERTISEMENT"
  | "ENTERTAINMENT"
  | "NEWS"
  | "STREAM";


export interface PlaylistItem {
  id: number;
  playlistId: number;
  type: PlaylistItemType;
  contentId: number;
  order: number;
  duration?: number;
}

export interface PlaylistItemCreateInput {
  type: PlaylistItemType;
  contentId: number; // generic in frontend
  order: number;
}