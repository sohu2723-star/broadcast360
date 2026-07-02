import { NextRequest, NextResponse } from "next/server";
import { PlaylistService } from "@/services/playlist.service";

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{ programId: string }>;
  }
) {
  try {
    const { programId } = await context.params;

    const programIdNum = Number(programId);

    if (isNaN(programIdNum)) {
      return NextResponse.json(
        { message: "Invalid programId" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const playlist = await PlaylistService.createPlaylist(
      programIdNum,
      body
    );

    return NextResponse.json(
      {
        message: "Playlist created successfully",
        data: playlist,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      },
      { status: 500 }
    );
  }
}


export async function GET(
req:Request,
context:{
 params:Promise<{
  programId:string
 }>
}

){


try{


const {programId}=await context.params;


const id=Number(programId);



const {searchParams}=new URL(req.url);



const page =
Number(
searchParams.get("page") ?? 1
);



const limit = 5;



const data =
await PlaylistService.getProgramPlaylists(
 id,
 page,
 limit
);



return NextResponse.json({

data

});



}catch(error){


return NextResponse.json({

message:
"Failed to load playlists"

},{
status:500
});


}

}