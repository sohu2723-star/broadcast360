import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET() {

  try {


    const now = new Date();


    const oneMonthAgo = new Date();

    oneMonthAgo.setMonth(
      oneMonthAgo.getMonth() - 1
    );



    const schedules = await prisma.schedule.findMany({

      where: {

        endTime: {

          lte: now,

          gte: oneMonthAgo,

        },

      },


      include: {

        channel: true,


        playlist: {

          include: {

            items: {

              where: {

                type: "ENTERTAINMENT",

              },


              include: {

                entertainment: true,

              },


              orderBy: {

                order: "asc",

              },

            },

          },

        },

      },


      orderBy: {

        endTime:"desc",

      },

    });





    const entertainments =
      schedules.flatMap((schedule)=>

        schedule.playlist.items

        .filter(
          (item)=>item.entertainment !== null
        )


        .map((item)=>({


          id:item.entertainment!.id,


          entertainmentKey:
          `${item.entertainment!.id}-${schedule.channel.id}-${schedule.id}`,


          title:
          item.entertainment!.title,


          description:
          item.entertainment!.description,


          category:
          item.entertainment!.category,



          thumbnail:
          item.entertainment!.thumbnail
          ? `http://localhost:3000${item.entertainment!.thumbnail}`
          : null,



          videoUrl:
          item.entertainment!.videoUrl
          ? item.entertainment!.videoUrl.startsWith("http")
            ? item.entertainment!.videoUrl
            : `http://localhost:3000${item.entertainment!.videoUrl}`
          : null,



          duration:
          item.entertainment!.duration,


          releaseYear:
          item.entertainment!.releaseYear,



          channelId:
          schedule.channel.id,


          channelName:
          schedule.channel.name,


          scheduleId:
          schedule.id,


          scheduleStart:
          schedule.startTime,


          scheduleEnd:
          schedule.endTime,


        }))

      );




    return NextResponse.json(

      {
        entertainments,
      },


      {

        status:200,


        headers:{

          "Access-Control-Allow-Origin":
          "http://localhost:3001",

          "Access-Control-Allow-Methods":
          "GET, OPTIONS",

          "Access-Control-Allow-Headers":
          "Content-Type",

        },

      }

    );



  } catch(error){


    console.error(
      "USER ENTERTAINMENT API ERROR:",
      error
    );



    return NextResponse.json(

      {
        message:
        "Failed to fetch entertainments",
      },


      {
        status:500,
      }

    );


  }

}