import { NextResponse } from "next/server";
import { ScheduleRepository } from "@/repositories/schedule.repository";
import { BroadcastService } from "@/services/broadcast.service";
import { ScheduleWithRelations } from "@/types/schedule.types";

const broadcast = new BroadcastService();

export async function POST(req: Request) {
  try {

    const body = await req.json();

    const { channelId } = body;


    if (!channelId) {
      return NextResponse.json(
        { error: "channelId required" },
        { status:400 }
      );
    }


    const schedule =
      await ScheduleRepository.findLiveSchedule(
        Number(channelId),
        new Date()
      );


    await broadcast.start(
      schedule,
      Number(channelId)
    );


    return NextResponse.json({
      message:"Broadcast started",
      channelId
    });


  } catch(err){

    console.error(err);

    return NextResponse.json(
      {
        error:"Internal error"
      },
      {
        status:500
      }
    );
  }
}