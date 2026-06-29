import { fetchChannelById, editChannel, removeChannel } 
from "@/services/channel.service";
import { updateChannelSchema } from "@/lib/validators/channel.validator";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request:Request,
  {params}:{params:Promise<{ id:string }>}){
    try{
        const { id } = await params;
        const channel = await fetchChannelById(Number(id));
         return Response.json(channel);
    } catch (error) {
    console.error("Database operation failed: to get channel by id", error);
    return Response.json(
      {message: "Failed to get channel by id"},
      {status:500}
    );
  }
}

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {

  try {

    const body = await request.json();

    const { id } = await params;

    const channelId = Number(id);



    // ZOD VALIDATION
    const result =
      updateChannelSchema.safeParse(body);



    if(!result.success){

      return NextResponse.json(
        {
          errors:
          result.error.flatten().fieldErrors
        },
        {
          status:400
        }
      );

    }




    // CHECK DUPLICATE NAME
    const existing =
      await prisma.channel.findFirst({

        where:{

          name: result.data.name,

          NOT:{
            id: channelId
          }

        }

      });



    if(existing){

      return NextResponse.json(

        {
          error:"Channel name already exists"
        },

        {
          status:409
        }

      );

    }





    const channel =
      await editChannel(

        channelId,

        result.data

      );



    return NextResponse.json(channel);



  } catch(error){


    console.error(
      "Database operation failed: update channel",
      error
    );


    return NextResponse.json(

      {
        message:"Failed to update channel"
      },

      {
        status:500
      }

    );

  }

}


export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id:string }> }) {

    try {
        const { id } = await params;
        await removeChannel(Number(id));
        return Response.json({
        message:"Channel deleted"
  });
    } catch (error) {
    console.error("Database operation failed: to delete channel", error);
    return Response.json(
      {message: "Failed to delete channel"},
      {status:500}
    );
  }
}
