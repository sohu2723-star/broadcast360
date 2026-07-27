import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";


interface Context {

 params:Promise<{
  id:string;
 }>;

}



export async function GET(

 request:NextRequest,

 context:Context

){


try{


const {id}=await context.params;


const entertainmentId =
Number(id);



if(Number.isNaN(entertainmentId)){


 return NextResponse.json(

  {
    message:"Invalid entertainment id"
  },

  {
    status:400
  }

 );


}



const entertainment =
await prisma.entertainment.findUnique({

 where:{

  id:entertainmentId,

 },


 include:{


  playlistItems:{


   include:{


    playlist:{


     include:{


      schedules:{


       include:{


        channel:true,


       },


      },


     },


    },


   },


  },


 },

});




if(!entertainment){


return NextResponse.json(

 {
  message:"Entertainment not found"
 },

 {
  status:404
 }

);


}



const schedule =
entertainment.playlistItems[0]
?.playlist
?.schedules[0];




return NextResponse.json({

 entertainment:{


  id:entertainment.id,


  title:entertainment.title,


  description:entertainment.description,


  category:entertainment.category,


  thumbnail:entertainment.thumbnail,


  videoUrl:entertainment.videoUrl,


  duration:entertainment.duration,


  releaseYear:entertainment.releaseYear,



  channelId:
  schedule?.channel.id ?? null,


  channelName:
  schedule?.channel.name ?? null,


  scheduleId:
  schedule?.id ?? null,


  scheduleStart:
  schedule?.startTime ?? null,


  scheduleEnd:
  schedule?.endTime ?? null,


 }


});


}catch(error){


console.error(
"GET ENTERTAINMENT BY ID ERROR:",
error
);



return NextResponse.json(

{
 message:"Failed to fetch entertainment"
},

{
 status:500
}

);


}

}