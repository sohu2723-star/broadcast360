import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET() {

  try {


    // Get database time
    const now = new Date();


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
    lte: now,
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

      console.log("NOW:", now);

console.log(
  schedules.map((s) => ({
    id: s.id,
    start: s.startTime,
    end: s.endTime,
    playlist: s.playlist.name,
  }))
);



    console.log(
      "SCHEDULE COUNT:",
      schedules.length
    );





  const entertainments = schedules
.map((schedule) => {

  console.log(
  "PLAYLIST ITEMS:",
  schedule.playlist.name,
  schedule.playlist.items.map(item => ({
    type: item.type,
    entertainmentId: item.entertainment?.id,
    title: item.entertainment?.title,
  }))
);


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