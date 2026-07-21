import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(
  req: Request,
  context: {
    params: Promise<{
      id:string
    }>
  }
){

  const {id} = await context.params;


  const channelId = Number(id);



  const channel =
    await prisma.channel.findUnique({

      where:{
        id:channelId
      }

    });



  if(!channel){

    return NextResponse.json(
      {
        success:false,
        message:"Channel not found"
      },
      {
        status:404
      }
    );

  }



  const session =
    await prisma.broadcastSession.findFirst({

      where:{
        channelId,
        status:"LIVE"
      },

      orderBy:{
        createdAt:"desc"
      }

    });



  if(!session){

    return NextResponse.json({

      success:true,

      live:false

    });

  }



  return NextResponse.json({

    success:true,

    live:true,

    channel:{
      id:channel.id,
      name:channel.name,
      logo:channel.logo
    },


    stream:{


      hls:
      `http://localhost:8888/live/${channel.streamKey}/index.m3u8`,


      webrtc:
      `http://localhost:8889/live/${channel.streamKey}`


    }


  });


}