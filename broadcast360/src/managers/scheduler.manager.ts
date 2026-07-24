import { ScheduleRepository } from "@/repositories/schedule.repository";
import { BroadcastService } from "@/services/broadcast.service";

export class SchedulerManager {
  private timers = new Map<number, NodeJS.Timeout>();

  private currentSchedule = new Map<number, number | null>();

  private mode = new Map<number, "SCHEDULE" | "FALLBACK">();

  constructor(private broadcast: BroadcastService) {
    /*
 LIVE END CALLBACK
*/

    this.broadcast.setLiveEndHandler(async (channelId: number) => {
      console.log("🔴 LIVE ended");

      // Forget old schedule state
      this.forceRefresh(channelId);

      // Let scheduler choose next content
      await this.checkNow(channelId);
    });
  }

  /*
=========================
 START
=========================
*/

  start(channelId: number) {
    if (this.timers.has(channelId)) {
      return;
    }

    console.log("🕒 Scheduler started", channelId);

    /*
 immediate check
 after startup
*/

    this.checkNow(channelId);

    const timer = setInterval(async () => {
      try {
        await this.checkNow(channelId);
      } catch (error) {
        console.error("❌ Scheduler error", error);
      }
    }, 5000);

    this.timers.set(channelId, timer);
  }

  /*
=========================
 CHECK
=========================
*/

  async checkNow(channelId: number) {
    /*
=====================
 LIVE RUNNING
=====================
*/

    if (this.broadcast.isLive(channelId)) {
      console.log("🔴 LIVE active");

      return;
    }

    const now = new Date();

    const schedule = await ScheduleRepository.findLiveSchedule(channelId, now);

    /*
=====================
 SCHEDULE FOUND
=====================
*/

    if (schedule) {
      const current = this.currentSchedule.get(channelId);

      if (current !== schedule.id || !this.broadcast.isRunning(channelId)) {
        console.log("📺 Start schedule", schedule.id);

        this.currentSchedule.set(channelId, schedule.id);

        this.mode.set(channelId, "SCHEDULE");

        await this.broadcast.switchBroadcast(schedule, channelId);
      }

      return;
    }

    /*
=====================
 NO SCHEDULE
=====================
*/

    console.log("🔁 No schedule");

    if (
      this.mode.get(channelId) === "FALLBACK" &&
      this.broadcast.isRunning(channelId)
    ) {
      return;
    }

    console.log("🔁 Starting fallback");

    this.currentSchedule.set(channelId, null);

    this.mode.set(channelId, "FALLBACK");

    await this.broadcast.switchBroadcast(null, channelId);
  }

  forceRefresh(channelId: number) {
    console.log("🔄 Force scheduler refresh", channelId);

    this.currentSchedule.delete(channelId);
  }

  /*
=========================
 STOP
=========================
*/

  stop(channelId: number) {
    const timer = this.timers.get(channelId);

    if (timer) {
      clearInterval(timer);
    }

    this.timers.delete(channelId);

    this.currentSchedule.delete(channelId);

    this.mode.delete(channelId);

    console.log("🛑 Scheduler stopped", channelId);
  }

  isRunning(channelId: number) {
    return this.timers.has(channelId);
  }
}
