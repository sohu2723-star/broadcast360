import { prisma } from "@/lib/prisma";


export class SessionManager {


  async start(
    channelId:number,
    scheduleId?:number
  ){


    const existing =
      await prisma.broadcastSession.findFirst({

        where:{

          channelId,

          status:{
            in:[
              "STARTING",
              "LIVE",
              "SWITCHING"
            ]
          }

        }

      });



    if(existing){

      console.log(
        "⚠ Existing session:",
        existing.id
      );

      return existing;

    }



    return prisma.broadcastSession.create({

      data:{

        channelId,

        scheduleId,

        status:"STARTING"

      }

    });


  }





  async live(sessionId:number){

    return prisma.broadcastSession.update({

      where:{
        id:sessionId
      },

      data:{

        status:"LIVE",

        startedAt:new Date()

      }

    });

  }







  async stop(channelId:number){

    return prisma.broadcastSession.updateMany({

      where:{

        channelId,

        status:{
          in:[
            "STARTING",
            "LIVE",
            "SWITCHING"
          ]
        }

      },

      data:{

        status:"STOPPED",

        stoppedAt:new Date()

      }

    });

  }







  async getActiveSession(channelId:number){


    return prisma.broadcastSession.findFirst({

      where:{

        channelId,

        status:{
          in:[
            "STARTING",
            "LIVE",
            "SWITCHING"
          ]
        }

      }

    });


  }






  async isLive(channelId:number){

    const session =
      await this.getActiveSession(
        channelId
      );


    return !!session;

  }







  async switching(channelId:number){

    return prisma.broadcastSession.updateMany({

      where:{

        channelId,

        status:"LIVE"

      },


      data:{

        status:"SWITCHING"

      }

    });

  }







  async resumeLive(channelId:number){

    return prisma.broadcastSession.updateMany({

      where:{

        channelId,

        status:"SWITCHING"

      },


      data:{

        status:"LIVE"

      }

    });

  }






  async error(
    channelId:number,
    message:string
  ){

    return prisma.broadcastSession.updateMany({

      where:{
        channelId
      },

      data:{

        status:"ERROR",

        errorMessage:message

      }

    });

  }



}