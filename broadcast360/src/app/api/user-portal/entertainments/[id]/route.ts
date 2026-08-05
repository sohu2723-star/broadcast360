import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


interface Context {
  params: Promise<{
    id: string;
  }>;
}



export async function GET(
  request: Request,
  context: Context
) {


  try {


    const { id } = await context.params;


    const playlistId = Number(id);



    if (Number.isNaN(playlistId)) {


      return NextResponse.json(
        {
          message: "Invalid playlist id"
        },
        {
          status: 400
        }
      );


    }



    const playlist =
      await prisma.playlist.findUnique({


        where: {
          id: playlistId,
        },


        include: {


          items: {


            where: {
              type: "ENTERTAINMENT"
            },


            orderBy: {
              order: "asc"
            },


            include: {

              entertainment: true,

            },


          },


          schedules: {

            include: {

              channel: true

            }

          },


        },


      });





    if (!playlist) {


      return NextResponse.json(

        {
          message: "Playlist not found"
        },

        {
          status: 404
        }

      );


    }




    const schedule =
      playlist.schedules[0];





    /*
      Current Playlist Parts
    */

    const items =
      playlist.items

        .filter(
          item =>
            item.entertainment !== null
        )

        .map(

          item => ({

            
            

            id:
            item.entertainment!.id,


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

            ? `http://localhost:3000${item.entertainment!.videoUrl}`

            : null,



            duration:
            item.entertainment!.duration,


            releaseYear:
            item.entertainment!.releaseYear,

            channelName:
            schedule?.channel.name ?? null,

             channelLogo:
          schedule?.channel.logo
            ? `http://localhost:3000${schedule.channel.logo}`
            : null,

          scheduleStart:
            schedule?.startTime ?? null,

          })

        );





    /*
      Related Entertainment

      Same source as main entertainment page:
      Schedule -> Playlist -> First Entertainment

    */



    const dbNowResult =
      await prisma.$queryRaw<
        { db_now: Date }[]
      >`

        SELECT NOW() as db_now

      `;



    const now =
      dbNowResult[0].db_now;



    const oneMonthAgo =
      new Date(now);



    oneMonthAgo.setMonth(
      oneMonthAgo.getMonth() - 1
    );





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





  const relatedEntertainments =

  schedules

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


        // keep old playback flow
        id:
        schedule.playlist.id,


        playlistId:
        schedule.playlist.id,


        playlistName:
        schedule.playlist.name,


        title:
        schedule.playlist.name,


        category:
        entertainment.category,

        releaseYear:
        entertainment.releaseYear,


        thumbnail:

        entertainment.thumbnail

        ? `http://localhost:3000${entertainment.thumbnail}`

        : null,


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


      };


    })


    .filter(

      (
        item
      ): item is NonNullable<typeof item> =>

        item !== null

    )


    // remove current playback playlist

    .filter(

      item =>

        item.playlistId !== playlist.id

    )


    // same category

    .filter(

      item =>

        item.category === items[0]?.category

    )


    // random

    .sort(

      () => Math.random() - 0.5

    )


    // only 10 cards

    .slice(0, 10);




    return NextResponse.json({


      playlist:{


        id:playlist.id,


        name:playlist.name,


        thumbnail:

        items[0]?.thumbnail ?? null,



        channelId:

        schedule?.channel.id ?? null,



        channelName:

        schedule?.channel.name ?? null,

        channelLogo:
        schedule?.channel.logo
        ? `http://localhost:3000${schedule.channel.logo}`
        : null,


      airedAt:
      schedule?.startTime ?? null,
      },



      items,



      currentItem:

      items[0],



      relatedEntertainments,


    });





  } catch(error) {


    console.error(

      "PLAYBACK PLAYLIST ERROR:",

      error

    );



    return NextResponse.json(


      {

        message:"Failed to fetch playlist"

      },


      {

        status:500

      }


    );


  }


}