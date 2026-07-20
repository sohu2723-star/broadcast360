import { PlaylistItemWithRelations } from "@/types/playlist";

type QueueMode = "FALLBACK" | "SCHEDULE";

interface QueueState {
  items: PlaylistItemWithRelations[];

  /**
   * current playing index
   */
  index: number;

  mode: QueueMode;
}

export class PlayoutQueueManager {
  private queues = new Map<number, QueueState>();

  private current = new Map<number, PlaylistItemWithRelations>();

  /**
   * Load new playlist queue
   */
  load(
    channelId: number,
    items: PlaylistItemWithRelations[],
    mode: QueueMode,
    startIndex: number = 0,
  ) {
    console.log("📥 Queue loaded", {
      channelId,
      mode,
      totalItems: items.length,
      startIndex,
    });

    this.queues.set(channelId, {
      items: [...items],

      // IMPORTANT
      // start from catchup item
      index: startIndex,

      mode,
    });
  }

  /**
   * Get next item
   */
  next(channelId: number) {
    const queue = this.queues.get(channelId);

    if (!queue) {
      console.log("⚠ No queue", channelId);

      return null;
    }

    /**
     * Queue finished
     */
    if (queue.index >= queue.items.length) {
      /**
       * fallback playlist loops forever
       */
      if (queue.mode === "FALLBACK") {
        console.log("🔁 Fallback loop");

        queue.index = 0;
      } else {

      /**
       * schedule ends
       */
        console.log("📺 Schedule completed");

        return null;
      }
    }

    const item = queue.items[queue.index];

    console.log("▶ Queue next", {
      index: queue.index,
      type: item.type,
    });

    queue.index++;

    this.current.set(channelId, item);

    return item;
  }

  /**
   * Replace current queue
   * used for schedule switching
   */
  replace(
    channelId: number,
    items: PlaylistItemWithRelations[],
    mode: QueueMode,
    startIndex: number = 0,
  ) {
    console.log("🔄 Queue replaced", {
      channelId,
      mode,
      startIndex,
    });

    this.load(channelId, items, mode, startIndex);
  }

  getMode(channelId: number) {
    return this.queues.get(channelId)?.mode;
  }

  getIndex(channelId: number) {
    return this.queues.get(channelId)?.index;
  }

  isEmpty(channelId: number) {
    const queue = this.queues.get(channelId);

    if (!queue) {
      return true;
    }

    return queue.index >= queue.items.length;
  }

  getCurrent(channelId: number) {
    return this.current.get(channelId);
  }

  clear(channelId: number) {
    this.queues.delete(channelId);

    this.current.delete(channelId);
  }
}
