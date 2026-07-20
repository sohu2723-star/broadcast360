import { prisma } from "@/lib/prisma";


export class LiveManager {


async start(channelId:number){

 const channel =
 await prisma.channel.findUnique({
    where:{
      id:channelId
    }
 });


 if(!channel){
    throw new Error("Channel not found");
 }


 await prisma.stream.updateMany({

    where:{
      channelId
    },

    data:{
      status:"ONLINE"
    }

 });


 return {

   channelId,

   streamKey:channel.streamKey,

   rtmp:
   `rtmp://localhost:1935/channel-${channelId}`

 };

}



async stop(channelId:number){


 await prisma.stream.updateMany({

   where:{
     channelId
   },

   data:{
     status:"OFFLINE"
   }

 });


 return true;

}


}