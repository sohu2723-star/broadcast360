import { ScheduleRepository } from "@/repositories/schedule.repository";
import { BroadcastService } from "@/services/broadcast.service";

export class SchedulerManager {
  private timer: NodeJS.Timeout | null = null;

  private broadcast = new BroadcastService();

  private currentSchedule = new Map<number, number>();

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

          return;
        }

        const oldSchedule = this.currentSchedule.get(channelId);

        // same schedule, no restart
        if (oldSchedule === schedule.id) {
          return;
        }

        console.log("🔄 New schedule detected:", schedule.playlist.name);

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
