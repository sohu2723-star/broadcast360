import { PlaylistItem } from "@/generated/prisma/client";


export class PlaylistManager {
  private items: any[] = [];
  private index = 0;


  load(items: any[]) {
    this.items = items;
    this.index = 0;
  }


  current() {
    return this.items[this.index];
  }


  next() {
    this.index++;

    // 🔥 24/7 LOOP
    if (this.index >= this.items.length) {
      this.index = 0;
    }
  }
}