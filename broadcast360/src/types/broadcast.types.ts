import { PlaylistItemWithRelations } from "./playlist";

export interface BroadcastState {
  status: "LIVE" | "STOPPED";
  currentItem: PlaylistItemWithRelations;
  startedAt: Date;
}