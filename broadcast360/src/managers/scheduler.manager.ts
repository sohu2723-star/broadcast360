import { ScheduleRepository } from "@/repositories/schedule.repository";
import { BroadcastService } from "@/services/broadcast.service";

export class SchedulerManager {
  private timer: NodeJS.Timeout | null = null;

  private broadcast = new BroadcastService();

  // current schedule id per channel
  private currentSchedule = new Map<number, number>();

  // fallback mode per channel
  private usingFallback = new Map<number, boolean>();

  start(channelId: number) {
    if (this.timer) {
      console.log("⚠ Scheduler already running");

      return;
    }

    console.log(`🕒 Scheduler started channel ${channelId}`);

    this.timer = setInterval(async () => {
      try {
        console.log("🕒 Scheduler tick", new Date().toLocaleString());

        const now = new Date();

        const schedule = await ScheduleRepository.findLiveSchedule(
          channelId,
          now,
        );

        // ==========================
        // FALLBACK MODE
        // ==========================

        if (!schedule) {
          const alreadyFallback = this.usingFallback.get(channelId);

          if (alreadyFallback) {
            // already playing fallback
            return;
          }

          console.log("🔁 Switching to fallback playlist");

          this.currentSchedule.delete(channelId);

          this.usingFallback.set(channelId, true);

          await this.broadcast.switchBroadcast(null, channelId);

          return;
        }

        // ==========================
        // SCHEDULE MODE
        // ==========================

        const currentScheduleId = this.currentSchedule.get(channelId);

        const isSameSchedule = currentScheduleId === schedule.id;

        const isAlreadySchedule = this.usingFallback.get(channelId) === false;

        if (isSameSchedule && isAlreadySchedule) {
          // nothing changed
          return;
        }

        console.log("📺 Switching schedule:", schedule.playlist?.name);

        this.currentSchedule.set(channelId, schedule.id);

        this.usingFallback.set(channelId, false);

        await this.broadcast.switchBroadcast(schedule, channelId);
      } catch (error) {
        console.error("Scheduler error:", error);
      }
    }, 5000); // check every 5 sec
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);

      this.timer = null;
    }
  }
}
