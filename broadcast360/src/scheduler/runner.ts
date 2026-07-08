import { ScheduleRepository } from "@/repositories/schedule.repository";
import { ScheduleWithRelations } from "@/types/schedule.types";
export class TVRunner {
  private runningChannels = new Map<number, NodeJS.Timeout>();

  start(channelId: number, callback: (schedule: ScheduleWithRelations) => void) {
    if (this.runningChannels.has(channelId)) return;

    const tick = async () => {
      const now = new Date();

      const schedules = await ScheduleRepository.getSchedulesAroundTime(now);

      const active = schedules.find(
        (s) =>
          s.channelId === channelId &&
          s.startTime <= now &&
          (!s.endTime || s.endTime >= now)
      );

      if (active) {
        callback(active);
      }
    };

    const interval = setInterval(tick, 5000); // check every 5 sec
    this.runningChannels.set(channelId, interval);
  }

  stop(channelId: number) {
    const interval = this.runningChannels.get(channelId);
    if (interval) clearInterval(interval);
    this.runningChannels.delete(channelId);
  }
}