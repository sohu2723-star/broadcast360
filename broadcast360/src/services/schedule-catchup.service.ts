import { ResolvedPlaylistItem } from "@/types/playlist";

export interface CatchupResult {
  itemIndex: number;
  offset: number;
}

export class ScheduleCatchupService {
  calculate(
    items: ResolvedPlaylistItem[],
    startTime: Date,
    now: Date,
  ): CatchupResult {
    if (items.length === 0) {
      return {
        itemIndex: 0,
        offset: 0,
      };
    }

    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);

    if (elapsed <= 0) {
      return {
        itemIndex: 0,
        offset: 0,
      };
    }

    let currentTime = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      /*
      ======================
          LIVE STREAM
      ======================

      Live has no duration.

      Once scheduler reaches it,
      stay on live until another
      schedule changes it.

      */

      if (item.type === "STREAM") {
        return {
          itemIndex: i,
          offset: 0,
        };
      }

      const duration = item.duration ?? 0;

      if (duration <= 0) {
        console.log(" SKIP ITEM WITHOUT DURATION", item);

        continue;
      }

      /*
      ======================
          CURRENT VOD ITEM
      ======================
      */

      if (elapsed >= currentTime && elapsed < currentTime + duration) {
        return {
          itemIndex: i,

          offset: elapsed - currentTime,
        };
      }

      currentTime += duration;
    }

    /*
    ======================
       PLAYLIST FINISHED
    ======================

    Important:
    Do not return items.length,
    because BroadcastService will
    get undefined.

    */

    return {
      itemIndex: items.length - 1,

      offset: 0,
    };
  }
}
