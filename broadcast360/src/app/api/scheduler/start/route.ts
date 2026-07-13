import { NextResponse } from "next/server";
import { scheduler } from "@/lib/scheduler";


export async function POST(req:Request){

  const body = await req.json();

  const {channelId} = body;


  if(!channelId){
    return NextResponse.json(
      {
        error:"channelId required"
      },
      {
        status:400
      }
    );
  }


  scheduler.start(
    Number(channelId)
  );


  return NextResponse.json({
    message:"Scheduler started",
    channelId
  });

}