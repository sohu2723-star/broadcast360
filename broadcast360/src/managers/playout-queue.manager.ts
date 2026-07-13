import { PlaylistItemWithRelations } from "@/types/playlist";

export class PlayoutQueueManager {
  private queues = new Map<number, PlaylistItemWithRelations[]>();

  private current = new Map<number, PlaylistItemWithRelations>();

  load(channelId: number, items: PlaylistItemWithRelations[]) {
    this.queues.set(channelId, [...items]);

    console.log(`📺 Queue loaded channel ${channelId}`, items.length);
  }

  next(channelId: number) {
    const queue = this.queues.get(channelId);

    if (!queue || queue.length === 0) {
      console.log("⚠ Queue empty", channelId);

      return null;
    }

    const item = queue.shift();

    if (!item) {
      return null;
    }

    // save current playing item
    this.current.set(channelId, item);

    // put it back for looping
    queue.push(item);

    return item;
  }

  /**
   * Replace queue while FFmpeg keeps running
   */
  replace(channelId: number, items: PlaylistItemWithRelations[]) {
    console.log(`🔄 Replacing queue channel ${channelId}`);

    this.queues.set(channelId, [...items]);

    console.log("New queue size:", items.length);
  }

  getCurrent(channelId: number) {
    return this.current.get(channelId);
  }

  clear(channelId: number) {
    this.queues.delete(channelId);

    this.current.delete(channelId);
  }
}
