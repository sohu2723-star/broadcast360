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





  const entertainments = schedules
.map((schedule) => {


  const firstEntertainment =
    schedule.playlist.items.find(
      (item) =>
        item.type === "ENTERTAINMENT" &&
        item.entertainment !== null
    );


  if (!firstEntertainment) {
    return null;
  }


  const entertainment =
    firstEntertainment.entertainment!;


 return {

  // Playback URL 
  id:
    schedule.playlist.id,

  playlistId:
    schedule.playlist.id,

  playlistName:
    schedule.playlist.name,

  title:
    schedule.playlist.name,

  thumbnail:
    entertainment.thumbnail
      ? `http://localhost:3000${entertainment.thumbnail}`
      : null,

  channelId:
    schedule.channel.id,

  category:
    entertainment.category,

  releaseYear:
    entertainment.releaseYear,

  channelName:
    schedule.channel.name,

  scheduleId:
    schedule.id,

  scheduleStart:
    schedule.startTime,

  scheduleEnd:
    schedule.endTime,

};


})
.filter(Boolean);



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