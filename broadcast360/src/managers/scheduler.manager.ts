import { ScheduleRepository } from "@/repositories/schedule.repository";
import { BroadcastService } from "@/services/broadcast.service";

export class SchedulerManager {
  private timers = new Map<number, NodeJS.Timeout>();

  private broadcast = new BroadcastService();

  // current running schedule
  private currentSchedule = new Map<number, number>();

  // fallback state
  private usingFallback = new Map<number, boolean>();

  start(channelId: number) {
    if (this.timers.has(channelId)) {
      console.log(`⚠ Scheduler already running ${channelId}`);

      return;
    }

    console.log(`🕒 Scheduler started channel ${channelId}`);

    const timer = setInterval(async () => {
      try {
        console.log("🕒 Scheduler tick", new Date().toLocaleTimeString());

        const now = new Date();

        const schedule = await ScheduleRepository.findLiveSchedule(
          channelId,
          now,
        );

        /*
        ============================
        FALLBACK PLAYLIST
        ============================
        */

        if (!schedule) {
          const fallback = this.usingFallback.get(channelId);

          if (fallback) {
            return;
          }

          console.log("🔁 No schedule -> fallback");

          this.currentSchedule.delete(channelId);

          this.usingFallback.set(channelId, true);

          if (this.broadcast.isRunning(channelId)) {
            await this.broadcast.switchBroadcast(null, channelId);
          } else {
            await this.broadcast.start(null, channelId);
          }

          return;
        }

        /*
        ============================
        SCHEDULE PLAYLIST
        ============================
        */

        const current = this.currentSchedule.get(channelId);

        const same = current === schedule.id;

        const alreadySchedule = this.usingFallback.get(channelId) === false;

        if (same && alreadySchedule && this.broadcast.isRunning(channelId)) {
          return;
        }

        console.log(
          "📺 Active schedule:",
          schedule.id,
          schedule.playlist?.name,
        );

        this.currentSchedule.set(channelId, schedule.id);

        this.usingFallback.set(channelId, false);

        /*
        IMPORTANT PART

        First start:
        FFmpeg not running
        -> start()

        Already playing:
        -> switch()
        */

        if (!this.broadcast.isRunning(channelId)) {
          console.log("▶ Starting new broadcast");

          await this.broadcast.start(schedule, channelId);
        } else {
          console.log("🔄 Switching playlist");

          await this.broadcast.switchBroadcast(schedule, channelId);
        }
      } catch (error) {
        console.error("Scheduler error:", error);
      }
    }, 5000);

    this.timers.set(channelId, timer);
  }

  stop(channelId: number) {
    const timer = this.timers.get(channelId);

    if (!timer) {
      return;
    }

    clearInterval(timer);

    this.timers.delete(channelId);

    this.currentSchedule.delete(channelId);

    this.usingFallback.delete(channelId);

    console.log(`🛑 Scheduler stopped ${channelId}`);
  }

  isRunning(channelId: number) {
    return this.timers.has(channelId);
  }
}
