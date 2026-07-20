import { NextRequest, NextResponse } from "next/server";
import { ScheduleService } from "@/services/schedule.service";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const schedule = await ScheduleService.getById(Number(id));
  if (!schedule) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(schedule);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {

    const { id } = await context.params;
    const scheduleId = Number(id);

    const body = await req.json();

    const {
      channelId,
      playlistId,
      startTime,
      endTime,
    } = body;


    const start = new Date(startTime);
    const end = new Date(endTime);


    const schedules = await prisma.schedule.findMany({
      where:{
        channelId:Number(channelId)
      }
    });


    const conflict = schedules.some((schedule)=>{

      // ignore current schedule
      if(schedule.id === scheduleId) {
        return false;
      }


      const existingStart = new Date(schedule.startTime);
      const existingEnd = schedule.endTime
        ? new Date(schedule.endTime)
        : existingStart;


      return (
        start < existingEnd &&
        end > existingStart
      );
    });


    if(conflict){
      return NextResponse.json(
        {
          message:
          "Schedule conflict: another playlist exists in this time range."
        },
        {
          status:409
        }
      );
    }


    const updatedSchedule = await prisma.schedule.update({
      where:{
        id:scheduleId
      },
      data:{
        channelId:Number(channelId),
        playlistId:Number(playlistId),
        startTime:start,
        endTime:end
      }
    });


    return NextResponse.json({
      success:true,
      data:updatedSchedule
    });


  } catch(error){

    console.error(error);

    return NextResponse.json(
      {
        message:"Failed to update schedule"
      },
      {
        status:500
      }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await ScheduleService.delete(Number(id));
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 }
    );
  }
}