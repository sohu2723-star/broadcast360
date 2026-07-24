import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET() {

  try {


    // Get database time
    const dbNowResult = await prisma.$queryRaw<
      { db_now: Date }[]
    >`

      SELECT NOW() as db_now

    `;


    const now = dbNowResult[0].db_now;


    const oneMonthAgo = new Date(now);

    oneMonthAgo.setMonth(
      oneMonthAgo.getMonth() - 1
    );



    console.log("DATABASE NOW:", now);
    console.log("ONE MONTH AGO:", oneMonthAgo);



    const schedules =
      await prisma.schedule.findMany({

        where: {

          endTime: {

            lt: now,

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


          endTime: "desc",


        },


      });



    console.log(
      "SCHEDULE COUNT:",
      schedules.length
    );





    const entertainments = schedules.flatMap(

      (schedule) =>


        schedule.playlist.items

        .filter(

          (item) =>

            item.entertainment !== null

        )


        .map(

          (item) => {


            const entertainment =
              item.entertainment!;



            return {


              id:
              entertainment.id,


              entertainmentKey:
              `${entertainment.id}-${schedule.channel.id}-${schedule.id}`,



              title:
              entertainment.title,



              description:
              entertainment.description,



              category:
              entertainment.category,



              thumbnail:
              entertainment.thumbnail

              ? `http://localhost:3000${entertainment.thumbnail}`

              : null,



              videoUrl:
              entertainment.videoUrl

              ? entertainment.videoUrl.startsWith("http")

                ? entertainment.videoUrl

                : `http://localhost:3000${entertainment.videoUrl}`

              : null,



              duration:
              entertainment.duration,



              releaseYear:
              entertainment.releaseYear,



              channelId:
              schedule.channel.id,



              channelName:
              schedule.channel.name,



              playlistId:
              schedule.playlist.id,



              scheduleId:
              schedule.id,



              scheduleStart:
              schedule.startTime,



              scheduleEnd:
              schedule.endTime,


            };


          }


        )


    );




    console.log(
      "ENTERTAINMENT COUNT:",
      entertainments.length
    );



    return NextResponse.json(

      {

        entertainments,

      },


      {

        status: 200,

      }

    );



  } catch(error) {


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

        status: 500,

      }

    );


  }

}