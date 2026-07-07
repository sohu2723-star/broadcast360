import { PlaylistItem } from "@/generated/prisma/client";

export class PlaylistManager {
  private items: PlaylistItem[] = [];
  private index = 0;

  load(items: PlaylistItem[]) {
    this.items = [...items].sort((a, b) => a.order - b.order);
    this.index = 0;
  }

  current() {
    return this.items[this.index] ?? null;
  }

  next() {
    if (this.index + 1 >= this.items.length) {
      return null;
    }

    this.index++;
    return this.items[this.index];
  }

  hasNext() {
    return this.index + 1 < this.items.length;
  }

  reset() {
    this.index = 0;
  }

  isFinished() {
    return this.index >= this.items.length - 1;
  }
}