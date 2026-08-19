import { NextResponse } from "next/server";

import { SwitchManager } from "@/managers/switch-manager";
import { FFmpegManager } from "@/streaming/ffmpeg";
import { LiveManager } from "@/managers/live-manager";


const ffmpeg = new FFmpegManager();

const live = new LiveManager(ffmpeg);
const switcher = new SwitchManager(ffmpeg);


export async function POST(
  request: Request
) {

  try {

    const body = await request.json();


    const {
      channelId,
      inputUrl,
      streamKey,
    } = body;


    if(
      !channelId ||
      !inputUrl ||
      !streamKey
    ){
      return NextResponse.json(
        {
          error:"channelId inputUrl streamKey required"
        },
        {
          status:400
        }
      );
    }


    const parsedChannelId = Number(channelId);
    await live.start(parsedChannelId, inputUrl, streamKey);
    await switcher.switchToLIVE(parsedChannelId, streamKey);


    return NextResponse.json({
      success:true,
      message:"LIVE started",
    });


  } catch(error){

    console.error(
      "LIVE START ERROR",
      error
    );


    return NextResponse.json(
      {
        error:"LIVE failed"
      },
      {
        status:500
      }
    );
  }
}