import { BroadcastState } from "@/types/broadcast.types";
import { PlaylistItemWithRelations } from "@/types/playlist";

export class BroadcastStateManager {

  private states = new Map<number, BroadcastState>();


  start(channelId: number, item: PlaylistItemWithRelations) {

    this.states.set(channelId, {
      status: "LIVE",
      currentItem: item,
      startedAt: new Date(),
    });

  }


  updateItem(channelId: number, item: PlaylistItemWithRelations) {

    const state = this.states.get(channelId);

    if (!state) return;


    this.states.set(channelId, {
      ...state,
      currentItem: item,
      startedAt: new Date(),
    });

  }


  stop(channelId: number) {

    this.states.delete(channelId);

  }


  get(channelId: number) {

    return this.states.get(channelId);

  }

}