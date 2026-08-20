import { ResolvedPlaylistItem } from "@/types/playlist";

export class PlayoutManager {
  private queues = new Map<number, ResolvedPlaylistItem[]>();

  private index = new Map<number, number>();

  start(
    channelId: number,
    items: ResolvedPlaylistItem[],
    startIndex: number = 0,
  ) {
    console.log(" PLAYOUT LOAD", {
      channelId,
      total: items.length,
      startIndex,
    });

    this.queues.set(channelId, items);

    this.index.set(channelId, startIndex);
  }

  next(channelId: number): ResolvedPlaylistItem | null {
    const queue = this.queues.get(channelId);

    if (!queue) {
      return null;
    }

    const current = this.index.get(channelId) ?? 0;

    const item = queue[current];

    if (!item) {
      console.log(" PLAYLIST FINISHED", channelId);

      return null;
    }

    this.index.set(channelId, current + 1);

    return item;
  }

  peek(channelId: number): ResolvedPlaylistItem | null {
    const queue = this.queues.get(channelId);

    if (!queue) {
      return null;
    }

    const current = this.index.get(channelId) ?? 0;

    return queue[current] ?? null;
  }

  reset(channelId: number) {
    this.index.set(channelId, 0);
  }

  clear(channelId: number) {
    this.queues.delete(channelId);

    this.index.delete(channelId);
  }

  isEmpty(channelId: number) {
    return !this.peek(channelId);
  }
}
