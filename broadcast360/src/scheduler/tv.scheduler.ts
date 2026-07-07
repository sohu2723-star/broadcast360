import { ScheduleRepository } from "@/repositories/schedule.repository";
import { getAllChannels } from "@/repositories/channel.repository";
import { BroadcastService } from "@/services/broadcast.service";

export class TVScheduler {
  private interval: NodeJS.Timeout | null = null;

  private broadcastService: BroadcastService;


  // channelId -> current source
  private activeChannels = new Map<number, string>();


  constructor() {
    this.broadcastService = new BroadcastService();
  }


  start() {

    if (this.interval) return;


    console.log("📺 TV Scheduler started...");


    this.interval = setInterval(
      () => this.tick(),
      5000
    );
  }



  stop() {

    if (!this.interval) return;


    clearInterval(this.interval);

    this.interval = null;


    console.log("⛔ TV Scheduler stopped");
  }




  private async tick() {

    try {

      const channels =
        await getAllChannels();


      const now = new Date();



      for (const channel of channels) {


        const schedule =
          await ScheduleRepository.findLiveSchedule(
            channel.id,
            now
          );



        // ==========================
        // CASE 1: Scheduled program
        // ==========================

        if (schedule) {


          const current =
            this.activeChannels.get(channel.id);



          const key =
            `schedule-${schedule.id}`;



          if (current === key) {
            continue;
          }



          console.log(
            `📡 Channel ${channel.id} schedule ${schedule.id}`
          );


          this.activeChannels.set(
            channel.id,
            key
          );



          await this.broadcastService.start(
            schedule,
            channel.id
          );


          continue;
        }




        // ==========================
        // CASE 2: Default 24/7 playlist
        // ==========================


        const current =
          this.activeChannels.get(channel.id);



        if (current === "default") {
          continue;
        }



        console.log(
          `📺 Channel ${channel.id} using default playlist`
        );



        this.activeChannels.set(
          channel.id,
          "default"
        );



        await this.broadcastService.start(
          null,
          channel.id
        );

      }



    } catch(err) {

      console.error(
        "Scheduler error:",
        err
      );

    }

  }

}