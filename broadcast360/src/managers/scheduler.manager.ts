import { ScheduleRepository } from "@/repositories/schedule.repository";
import { BroadcastService } from "@/services/broadcast.service";

export class SchedulerManager {
  private timer: NodeJS.Timeout | null = null;

  private broadcast = new BroadcastService();

  private currentSchedule = new Map<number, number>();

  private usingFallback = new Map<number, boolean>();

  start(channelId: number) {
    console.log(`🕒 Scheduler started channel ${channelId}`);

    this.timer = setInterval(async () => {
      try {
        const now = new Date();

        const schedule = await ScheduleRepository.findLiveSchedule(
          channelId,
          now,
        );

        if (!schedule) {
          console.log("⚠ No active schedule");

          const isFallback = this.usingFallback.get(channelId);

          // already playing fallback
          if (isFallback) {
            return;
          }

          console.log("📺 Switching to default playlist");

          this.currentSchedule.delete(channelId);

          this.usingFallback.set(channelId, true);

          await this.broadcast.switchBroadcast(null, channelId);

          return;
        }

        const oldSchedule = this.currentSchedule.get(channelId);

        // same schedule, no restart
        if (oldSchedule === schedule.id) {
          return;
        }

        console.log("🔄 New schedule detected:", schedule.playlist.name);

        this.usingFallback.set(channelId, false);

        this.currentSchedule.set(channelId, schedule.id);

        if (oldSchedule) {
          await this.broadcast.switchBroadcast(schedule, channelId);
        } else {
          await this.broadcast.start(schedule, channelId);
        }
      } catch (error) {
        console.error("Scheduler error:", error);
      }
    }, 10000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);

      this.timer = null;
    }
  }
}
