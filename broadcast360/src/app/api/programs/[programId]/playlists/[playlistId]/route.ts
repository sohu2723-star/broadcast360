import { NextResponse } from "next/server";
import { PlaylistService } from "@/services/playlist.service";
import { updatePlaylistSchema } from "@/lib/validators/playlist.validator";


export async function GET(
  req: Request,
  context: {
    params: Promise<{
      programId: string;
      playlistId: string;
    }>;
  }
) {

try {


const { playlistId } =
await context.params;



const id =
Number(playlistId);



if(isNaN(id)){


return NextResponse.json(

{
message:"Invalid playlistId"
},

{
status:400
}

);

}




const playlist =
await PlaylistService.getPlaylistById(id);




if(!playlist){


return NextResponse.json(

{
message:"Playlist not found"
},

{
status:404
}

);

}




return NextResponse.json({

data:playlist

});



}catch(error){


return NextResponse.json(

{
message:
error instanceof Error
?
error.message
:
"Error fetching playlist"
},

{
status:500
}

);


}

}


export async function PUT(

request:Request,

context:{
params:Promise<{
playlistId:string
}>
}

){


try{


const {playlistId}=

await context.params;



const id =
Number(playlistId);



const body =
await request.json();



const result =
updatePlaylistSchema.safeParse(body);



if(!result.success){


return NextResponse.json(

{

errors:
result.error.flatten()
.fieldErrors

},

{
status:400
}

);

}



const playlist =

await PlaylistService.updatePlaylist(

id,

result.data

);



return NextResponse.json({

message:
"Playlist updated successfully",

data:playlist

});



}catch(error){


return NextResponse.json(

{

message:
"Failed to update playlist"

},

{
status:500
}

);


}

}