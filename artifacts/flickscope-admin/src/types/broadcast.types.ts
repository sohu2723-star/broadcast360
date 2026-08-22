import { PlaylistItemWithRelations } from "./playlist";

export interface BroadcastState {
  status: "LIVE" | "STOPPED";
  currentItem: PlaylistItemWithRelations;
  startedAt: Date;
}

export interface MediaPathSource {
  type: string;
}

export interface MediaPath {
  name: string;
  ready?: boolean;
  source?: MediaPathSource;
}

export interface MediaPathListResponse {
  items: MediaPath[];
}