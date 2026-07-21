import { ScheduleRepository } from "@/repositories/schedule.repository";
import { BroadcastService } from "@/services/broadcast.service";

export class SchedulerManager {
  private timers = new Map<number, NodeJS.Timeout>();

  private broadcast = new BroadcastService();

  private currentSchedule = new Map<number, number | null>();

  private fallback = new Map<number, boolean>();

  private nextSchedule = new Map<number, number | null>();

  start(channelId: number) {
    if (this.timers.has(channelId)) {
      return;
    }

    console.log("🕒 Scheduler started", channelId);

    const timer = setInterval(async () => {
      const now = new Date();

      console.log(
        "⏰ Scheduler checking",
        channelId,
        now.toISOString()
      );

      //----------------------------------------
      // Current schedule
      //----------------------------------------

      const schedule =
        await ScheduleRepository.findLiveSchedule(
          channelId,
          now
        );

      console.log(
        "📅 Found schedule:",
        schedule?.id ?? null
      );

      //----------------------------------------
      // Current schedule running
      //----------------------------------------

      if (schedule) {
        const current =
          this.currentSchedule.get(channelId);

        if (current !== schedule.id) {
          console.log(
            "📺 SWITCH SCHEDULE",
            schedule.id
          );

          this.currentSchedule.set(
            channelId,
            schedule.id
          );

          this.fallback.set(channelId, false);

          await this.broadcast.switchBroadcast(
            schedule,
            channelId
          );
        }

        //----------------------------------------
        // Preload next schedule
        //----------------------------------------

        if (schedule.endTime) {
          const remain =
            schedule.endTime.getTime() -
            now.getTime();

          if (remain <= 30000) {
            const next =
              await ScheduleRepository.findNextSchedule(
                channelId,
                schedule.endTime
              );

            if (next) {
              const cached =
                this.nextSchedule.get(channelId);

              if (cached !== next.id) {
                console.log(
                  "📦 Preloading next schedule",
                  next.id
                );

                this.nextSchedule.set(
                  channelId,
                  next.id
                );

                await this.broadcast.preloadSchedule(
                  next,
                  channelId
                );
              }
            }
          }
        }

        return;
      }

      //----------------------------------------
      // No current schedule
      //----------------------------------------

      const next =
        await ScheduleRepository.findNextSchedule(
          channelId,
          now
        );

      //----------------------------------------
      // Start next schedule immediately
      //----------------------------------------

      if (
        next &&
        next.startTime <= now
      ) {
        console.log(
          "▶ Starting next schedule",
          next.id
        );

        this.currentSchedule.set(
          channelId,
          next.id
        );

        this.nextSchedule.delete(channelId);

        this.fallback.set(channelId, false);

        await this.broadcast.switchBroadcast(
          next,
          channelId
        );

        return;
      }

      //----------------------------------------
      // Fallback
      //----------------------------------------

      if (this.fallback.get(channelId)) {
        return;
      }

      console.log("🔁 SWITCH FALLBACK");

      this.currentSchedule.set(channelId, null);

      this.nextSchedule.delete(channelId);

      this.fallback.set(channelId, true);

      await this.broadcast.switchBroadcast(
        null,
        channelId
      );
    }, 5000);

    this.timers.set(channelId, timer);
  }

  stop(channelId: number) {
    const timer = this.timers.get(channelId);

    if (timer) {
      clearInterval(timer);
    }

    this.timers.delete(channelId);

    this.currentSchedule.delete(channelId);

    this.nextSchedule.delete(channelId);

    this.fallback.delete(channelId);
  }

  isRunning(channelId: number) {
    return this.timers.has(channelId);
  }
}