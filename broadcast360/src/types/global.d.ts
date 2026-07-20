import { BroadcastService } from "@/services/broadcast.service";
import { SchedulerManager } from "@/managers/scheduler.manager";


declare global {

  var broadcastService:
    | BroadcastService
    | undefined;


  var schedulerManager:
    | SchedulerManager
    | undefined;

}


export {};