import { NextResponse } from "next/server";

import { BroadcastSessionRepository } from "@/repositories/broadcast-session.repository";


export async function GET(
  request: Request,
  context: {
    params: Promise<{
      channelId:string;
    }>
  }
){

  try {

    const {
      channelId
    } = await context.params;


    const id =
      Number(channelId);


    if(!id){

      return NextResponse.json(
        {
          error:"Invalid channel id"
        },
        {
          status:400
        }
      );

    }



    const session =
      await BroadcastSessionRepository.findByChannel(
        id
      );



    return NextResponse.json({

      data:session

    });


  }
  catch(error){

    console.error(error);


    return NextResponse.json(
      {
        error:"Failed loading broadcast session"
      },
      {
        status:500
      }
    );

  }

}