import { ScheduleRepository } from "@/repositories/schedule.repository";
import { broadcast } from "@/services/broadcast-container";

type SchedulerMode = "SCHEDULE" | "FALLBACK" | "WAITING_LIVE";

export class SchedulerManager {
  private timers = new Map<number, NodeJS.Timeout>();

  private currentSchedule = new Map<number, number | null>();

  private mode = new Map<number, SchedulerMode>();

  constructor() {
    broadcast.setPlaylistFinishedHandler(async (channelId) => {
      console.log("📺 PLAYLIST FINISHED", channelId);

      this.currentSchedule.delete(channelId);

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
        CHECK NOW
  =========================
  */

  async checkNow(channelId: number) {
    const now = new Date();

    const schedule = await ScheduleRepository.findLiveSchedule(channelId, now);

    const currentMode = this.mode.get(channelId);

    /*
    =========================
       WAITING LIVE RETRY
    =========================
    */

    if (currentMode === "WAITING_LIVE") {
      const retrySchedule =
        schedule ?? (await ScheduleRepository.findNextSchedule(channelId, now));

      if (retrySchedule) {
        console.log("⏳ RETRY LIVE", {
          channelId,
          scheduleId: retrySchedule.id,
        });

        try {
          // clear old broken LIVE state first
          await broadcast.recoverLive(channelId);

          await broadcast.switchBroadcast(retrySchedule, channelId, true);

          this.currentSchedule.set(channelId, retrySchedule.id);

          this.mode.set(channelId, "SCHEDULE");

          console.log("✅ LIVE RECOVERED", channelId);
        } catch (error) {
          console.log("⚠ LIVE STILL DOWN", channelId);
        }

        return;
      }
    }

    /*
    =========================
        ACTIVE SCHEDULE
    =========================
    */

    if (schedule) {
      const current = this.currentSchedule.get(channelId);

      const changed = current !== schedule.id;

      if (changed) {
        console.log("📺 START SCHEDULE", {
          channelId,
          scheduleId: schedule.id,
        });

        this.currentSchedule.set(channelId, schedule.id);

        this.mode.set(channelId, "SCHEDULE");

        try {
          await broadcast.switchBroadcast(schedule, channelId);
        } catch (error) {
          console.log("⚠ LIVE FAILED WAITING", {
            channelId,
            scheduleId: schedule.id,
          });

          this.mode.set(channelId, "WAITING_LIVE");
        }
      } else {
        console.log("⏭ SAME SCHEDULE", {
          channelId,
          scheduleId: schedule.id,
        });
      }

      return;
    }

    /*
    =========================
        NO SCHEDULE
    =========================
    */

    /*
=========================
    NO SCHEDULE
=========================
*/

    console.log("🔁 NO ACTIVE SCHEDULE", channelId);

    this.currentSchedule.set(channelId, null);

    /*
=========================
    CHECK NEXT SCHEDULE
=========================
*/

    const nextSchedule = await ScheduleRepository.findNextSchedule(
      channelId,
      now,
    );

    if (nextSchedule) {
      console.log("⏭ NEXT SCHEDULE WAITING", {
        channelId,
        scheduleId: nextSchedule.id,
        startTime: nextSchedule.startTime,
        playlist: nextSchedule.playlist.name,
      });

      this.mode.set(channelId, "WAITING_LIVE");

      return;
    }

    /*
=========================
    FALLBACK
=========================
*/

    if (
      this.mode.get(channelId) === "FALLBACK" &&
      broadcast.isRunning(channelId)
    ) {
      return;
    }

    console.log("🎬 START FALLBACK VOD", channelId);

    this.mode.set(channelId, "FALLBACK");

    await broadcast.switchBroadcast(null, channelId);
  }

  /*
  =========================
       FORCE REFRESH
  =========================
  */

  forceRefresh(channelId: number) {
    console.log("🔄 Force refresh", channelId);

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
