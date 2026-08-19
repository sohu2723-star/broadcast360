import { ScheduleRepository } from "@/repositories/schedule.repository";
import { broadcast } from "@/services/broadcast-container";

type SchedulerMode = "SCHEDULE" | "FALLBACK" | "WAITING" | "COMPLETED";

export class SchedulerManager {
  private timers = new Map<number, NodeJS.Timeout>();

  private currentSchedule = new Map<number, number | null>();

  private mode = new Map<number, SchedulerMode>();

  private switching = new Map<number, boolean>();

  private completedSchedule = new Map<number, number>();

  constructor() {
    /*
    =========================
       PLAYLIST FINISHED
    =========================
    */

    broadcast.setPlaylistFinishedHandler(async ({ channelId, scheduleId }) => {
      console.log("📺 PLAYLIST FINISHED", {
        channelId,
        scheduleId,
      });

      /*
        =====================
          SCHEDULE COMPLETE
        =====================
        */

      if (scheduleId) {
        await ScheduleRepository.updateStatus(scheduleId, "COMPLETED");

        this.completedSchedule.set(channelId, scheduleId);

        console.log("✅ SCHEDULE COMPLETED", scheduleId);
      }

      this.currentSchedule.set(channelId, null);

      this.mode.set(channelId, "COMPLETED");

      /*
        check what should happen next
        */

      await this.checkNow(channelId);
    });
  }

  /*
  =========================
          START
  =========================
  */

  async start(channelId: number) {
    if (this.timers.has(channelId)) {
      console.log("⚠ Scheduler already running", channelId);

      return;
    }

    console.log("🕒 Scheduler started", channelId);

    /*
       first check immediately
    */

    void this.checkNow(channelId);

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
        MAIN CHECK
  =========================
  */

  async checkNow(channelId: number) {
    /*
    prevent double execution
    */

    if (this.switching.get(channelId)) {
      console.log("⏳ Scheduler switching", channelId);

      return;
    }

    const now = new Date();

    const schedule = await ScheduleRepository.findLiveSchedule(channelId, now);

    console.log("🔎 Checking schedule", {
      channelId,
      now,
    });

    /*
    =========================
       ACTIVE SCHEDULE
    =========================
    */

    if (schedule) {
      const current = this.currentSchedule.get(channelId);

      if (current === schedule.id && this.mode.get(channelId) === "SCHEDULE") {
        console.log("⏭ SAME SCHEDULE", {
          channelId,
          scheduleId: schedule.id,
        });
        return;
      }

      if (this.completedSchedule.get(channelId) === schedule.id) {
        console.log("⏭ ALREADY COMPLETED", {
          channelId,
          scheduleId: schedule.id,
        });
        return;
      }

      console.log("📺 SWITCH TO SCHEDULE", {
        channelId,
        scheduleId: schedule.id,
      });

      this.switching.set(channelId, true);

      try {
        // Stop fallback if it's currently running
        if (broadcast.isRunning(channelId)) {
          console.log("🛑 STOP FALLBACK", channelId);
          await broadcast.stop(channelId);
        }

        // Start the scheduled playlist
        await broadcast.switchBroadcast(schedule, channelId);

        // Only update state after success
        this.currentSchedule.set(channelId, schedule.id);
        this.completedSchedule.delete(channelId);
        this.mode.set(channelId, "SCHEDULE");

        console.log("✅ SCHEDULE STARTED", {
          channelId,
          scheduleId: schedule.id,
        });
      } catch (error) {
        console.error("⚠ SCHEDULE FAILED", error);

        this.currentSchedule.delete(channelId);
        this.mode.set(channelId, "WAITING");
      } finally {
        this.switching.delete(channelId);
      }

      return;
    }
    /*
  =========================
       NO ACTIVE SCHEDULE
  =========================
  */

    console.log("🔁 NO ACTIVE SCHEDULE", channelId);

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
      console.log("⏳ WAITING NEXT SCHEDULE", {
        channelId,
        scheduleId: nextSchedule.id,
        startTime: nextSchedule.startTime,
      });

      this.mode.set(channelId, "WAITING");

      return;
    }

    /*
  =========================
          FALLBACK
  =========================
  */

    const currentMode = this.mode.get(channelId);

    /*
     Already playing fallback
  */

    if (currentMode === "FALLBACK" && broadcast.isRunning(channelId)) {
      console.log("⏭ FALLBACK ALREADY RUNNING", channelId);

      return;
    }

    console.log("🎬 START FALLBACK", channelId);

    this.switching.set(channelId, true);

    try {
      this.mode.set(channelId, "FALLBACK");

      this.currentSchedule.set(channelId, null);

      await broadcast.switchBroadcast(null, channelId);

      console.log("✅ FALLBACK STARTED", channelId);
    } catch (error) {
      console.error("❌ FALLBACK FAILED", error);
    } finally {
      this.switching.delete(channelId);
    }
  }

  /*
=========================
       FORCE REFRESH
=========================
*/

  forceRefresh(channelId: number) {
    console.log("🔄 FORCE REFRESH", channelId);

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

    this.completedSchedule.delete(channelId);

    this.mode.delete(channelId);

    this.switching.delete(channelId);

    console.log("🛑 Scheduler stopped", channelId);
  }

  /*
=========================
          STATUS
=========================
*/

  isRunning(channelId: number) {
    return this.timers.has(channelId);
  }

  getMode(channelId: number) {
    return this.mode.get(channelId) ?? null;
  }
}
