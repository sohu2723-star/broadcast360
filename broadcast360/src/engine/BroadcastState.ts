// src/engine/BroadcastState.ts

import { ChildProcess } from "child_process";
import { PlaylistItemWithRelations } from "@/types/playlist";
import { Stream } from "@/generated/prisma/client";

export enum BroadcastMode {
  STOPPED = "STOPPED",

  VOD = "VOD",

  PRELOADING = "PRELOADING",

  SWITCHING = "SWITCHING",

  LIVE = "LIVE",
}

export interface ChannelState {
  channelId: number;

  mode: BroadcastMode;

  currentItem?: PlaylistItemWithRelations;

  nextItem?: PlaylistItemWithRelations;

  liveStream?: Stream;

  activeFFmpeg?: ChildProcess;

  preloadFFmpeg?: ChildProcess;

  scheduleId?: number;

  startedAt?: Date;
}

export class BroadcastStateManager {
  private states = new Map<number, ChannelState>();

  get(channelId: number): ChannelState {
    let state = this.states.get(channelId);

    if (!state) {
      state = {
        channelId,
        mode: BroadcastMode.STOPPED,
      };

      this.states.set(channelId, state);
    }

    return state;
  }

  update(channelId: number, patch: Partial<ChannelState>) {
    const current = this.get(channelId);

    this.states.set(channelId, {
      ...current,
      ...patch,
    });
  }

  clear(channelId: number) {
    this.states.delete(channelId);
  }
}