import { TVScheduler } from "./tv.scheduler";

const scheduler = new TVScheduler();

export function startTVEngine() {
  console.log("🚀 TV Engine Started");

  setInterval(() => {
    scheduler.tick();
  }, 30000); // every 30s
}