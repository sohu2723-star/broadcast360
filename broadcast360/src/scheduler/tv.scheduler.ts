import { ScheduleRepository } from "@/repositories/schedule.repository";
import { BroadcastService } from "@/services/broadcast.service";

export class TVScheduler {
  private interval: NodeJS.Timeout | null = null;
  private broadcastService: BroadcastService;

  constructor() {
    this.broadcastService = new BroadcastService();
  }

  /**
   * Start scheduler loop
   */
  start() {
    if (this.interval) return;

    console.log("📺 TV Scheduler started...");

    this.interval = setInterval(async () => {
      await this.tick();
    }, 5000); // every 5 seconds
  }

  /**
   * Stop scheduler
   */
  stop() {
    if (!this.interval) return;

    clearInterval(this.interval);
    this.interval = null;

    console.log("⛔ TV Scheduler stopped");
  }

  /**
   * Main loop
   */
  private async tick() {
    try {
      const schedules = await this.getAllActiveSchedules();

      const now = new Date();

      for (const schedule of schedules) {
        const isActive =
          schedule.startTime <= now &&
          schedule.endTime &&
          schedule.endTime > now;

        if (!isActive) continue;

        await this.broadcastService.start(schedule);
      }
    } catch (err) {
      console.error("Scheduler error:", err);
    }
  }

  /**
   * Get schedules that could be running now
   */
  private async getAllActiveSchedules() {
    const now = new Date();

    // we get ALL schedules around current time window
    return ScheduleRepository.getSchedulesAroundTime(now);
  }
}