export type PlayoutMode = "SCHEDULE" | "FALLBACK";

export type PlayoutItem = {
  id: number;
  order: number;
  type: string;
  stream?: { url: string } | null;
  [key: string]: unknown;
};

type QueueState = {
  items: PlayoutItem[];
  index: number;
  mode: PlayoutMode;
};

export class PlayoutQueueManager {
  private queues = new Map<number, QueueState>();

  load(channelId: number, items: readonly unknown[], mode: PlayoutMode) {
    this.queues.set(channelId, {
      items: Array.from(items) as PlayoutItem[],
      index: 0,
      mode,
    });
  }

  replace(
    channelId: number,
    items: readonly unknown[],
    mode: PlayoutMode,
    startIndex = 0,
  ) {
    const normalizedItems = Array.from(items) as PlayoutItem[];
    this.queues.set(channelId, {
      items: normalizedItems,
      index: Math.max(0, Math.min(startIndex, normalizedItems.length)),
      mode,
    });
  }

  next(channelId: number): PlayoutItem | null {
    const queue = this.queues.get(channelId);
    if (!queue || queue.index >= queue.items.length) return null;
    return queue.items[queue.index++];
  }

  clear(channelId: number) {
    this.queues.delete(channelId);
  }

  getMode(channelId: number) {
    return this.queues.get(channelId)?.mode ?? null;
  }
}
