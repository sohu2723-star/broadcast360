import { PlaylistItemWithRelations } from "@/types/playlist";

export class QueueManager {
  private queues = new Map<number, PlaylistItemWithRelations[]>();

  load(
    channelId: number,
    items: PlaylistItemWithRelations[],
  ) {
    this.queues.set(channelId, [...items]);

    console.log(
      "📺 Queue Loaded",
      channelId,
      items.length,
    );
  }

  replace(
    channelId: number,
    items: PlaylistItemWithRelations[],
  ) {
    this.queues.set(channelId, [...items]);

    console.log(
      "🔄 Queue Replaced",
      channelId,
    );
  }

  current(channelId: number) {
    const queue = this.queues.get(channelId);

    return queue?.[0];
  }

  next(channelId: number) {
    const queue = this.queues.get(channelId);

    if (!queue || queue.length === 0) {
      return null;
    }

    return queue.shift() ?? null;
  }

  peek(channelId: number) {
    const queue = this.queues.get(channelId);

    if (!queue) {
      return null;
    }

    return queue[0] ?? null;
  }

  hasNext(channelId: number) {
    const queue = this.queues.get(channelId);

    return !!queue && queue.length > 0;
  }

  clear(channelId: number) {
    this.queues.delete(channelId);
  }
}