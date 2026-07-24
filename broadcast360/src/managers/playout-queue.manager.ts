import { PlaylistItemWithRelations } from "@/types/playlist";

type QueueMode = "FALLBACK" | "SCHEDULE";

interface QueueState {
  items: PlaylistItemWithRelations[];

  index: number;

  mode: QueueMode;
}

export class PlayoutQueueManager {
  private queues = new Map<number, QueueState>();

  private current = new Map<number, PlaylistItemWithRelations>();

  load(
    channelId: number,
    items: PlaylistItemWithRelations[],
    mode: QueueMode,
    startIndex = 0,
  ) {
    console.log("📥 Queue load", {
      channelId,
      mode,
      items: items.length,
      startIndex,
    });

    this.queues.set(channelId, {
      items: [...items],
      index: startIndex,
      mode,
    });

    this.current.delete(channelId);
  }

  next(channelId: number) {
    const queue = this.queues.get(channelId);

    if (!queue) {
      console.log("⚠ queue missing", channelId);

      return null;
    }

    if (queue.index >= queue.items.length) {
      if (queue.mode === "FALLBACK") {
        console.log("🔁 fallback restart");

        queue.index = 0;
      } else {
        console.log("📺 schedule finished");

        return null;
      }
    }

    const item = queue.items[queue.index];

    this.current.set(channelId, item);

    console.log("▶ Next item", {
      channelId,
      index: queue.index,
      id: item.id,
      type: item.type,
    });

    return item;
  }

  complete(channelId: number) {
    const queue = this.queues.get(channelId);

    if (!queue) return;

    queue.index++;

    this.current.delete(channelId);

    console.log("✅ Item complete", {
      channelId,
      nextIndex: queue.index,
    });
  }

  replace(
    channelId: number,
    items: PlaylistItemWithRelations[],
    mode: QueueMode,
    startIndex = 0,
  ) {
    this.load(channelId, items, mode, startIndex);
  }

  clear(channelId: number) {
    this.queues.delete(channelId);

    this.current.delete(channelId);
  }

  getCurrent(channelId: number) {
    return this.current.get(channelId) ?? null;
  }

  getMode(channelId: number): QueueMode | null {
  return this.queues.get(channelId)?.mode ?? null;
}

  getIndex(channelId: number) {
    return this.queues.get(channelId)?.index ?? 0;
  }

  getItems(channelId: number): PlaylistItemWithRelations[] {
  return this.queues.get(channelId)?.items ?? [];
}

getQueue(channelId: number) {
  return this.queues.get(channelId) ?? null;
}
}
