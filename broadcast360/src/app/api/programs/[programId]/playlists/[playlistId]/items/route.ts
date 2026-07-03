import { NextRequest, NextResponse } from "next/server";
import { PlaylistItemService } from "@/services/playlist-item.service";


export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      programId: string;
      playlistId: string;
    }>;
  }
) {

  try {


    const {
      playlistId
    } = await params;



    const id = Number(playlistId);



    if (isNaN(id)) {

      return NextResponse.json(
        {
          message: "Invalid playlistId"
        },
        {
          status: 400
        }
      );

    }



    const body =
      await req.json();



    const item =
      await PlaylistItemService.create(
        id,
        body
      );



    return NextResponse.json(

      {
        message:
          "Playlist item created successfully",

        data:item
      },

      {
        status:201
      }

    );



  } catch(error){


    console.error(error);



    return NextResponse.json(

      {
        message:
          error instanceof Error
          ? error.message
          : "Failed to create playlist item"
      },

      {
        status:500
      }

    );


  }

}