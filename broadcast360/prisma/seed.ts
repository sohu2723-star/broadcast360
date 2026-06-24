import { PrismaClient, Role, ProgramType, BroadcastStatus } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";


const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
});


const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });



async function main() {


  // ======================
  // USERS
  // ======================


  const admin = await prisma.user.create({

    data: {

      name: "Admin",

      email: "admin@broadcast360.com",

      password: "123456",

      role: Role.ADMIN

    }

  });



  const guest = await prisma.user.create({

    data: {

      name: "Guest User",

      email: "guest@broadcast360.com",

      password: "123456",

      role: Role.GUEST

    }

  });



  // ======================
  // CHANNELS
  // ======================


  const cnn = await prisma.channel.create({

    data: {

      name: "CNN",

      description:"International News Channel",

      logo:"/logos/cnn.png",

      country:"USA"

    }

  });



  const bbc = await prisma.channel.create({

    data: {

      name:"BBC World",

      description:"Global News Channel",

      logo:"/logos/bbc.png",

      country:"UK"

    }

  });



  // ======================
  // STREAMS
  // ======================


  await prisma.stream.create({

    data:{

      channelId:cnn.id,

      url:"rtsp://localhost:8554/cnn",

      protocol:"RTSP",

      status:"online"

    }

  });



  await prisma.stream.create({

    data:{

      channelId:bbc.id,

      url:"rtsp://localhost:8554/bbc",

      protocol:"RTSP",

      status:"offline"

    }

  });



  // ======================
  // MOVIE
  // ======================


  const movie = await prisma.movie.create({

    data:{

      title:"The Last Adventure",

      description:"Adventure movie",

      thumbnail:"/movies/adventure.jpg",

      videoUrl:"/videos/adventure.mp4",

      duration:7200,

      releaseYear:2026

    }

  });



  // ======================
  // SERIES
  // ======================


  const series = await prisma.series.create({

    data:{

      title:"Mystery Island",

      description:"Drama series",

      thumbnail:"/series/mystery.jpg"

    }

  });



  await prisma.episode.createMany({

    data:[

      {

      seriesId:series.id,

      title:"Episode 1",

      episodeNo:1,

      duration:3600,

      videoUrl:"/series/mystery/e1.mp4"

      },


      {

      seriesId:series.id,

      title:"Episode 2",

      episodeNo:2,

      duration:3600,

      videoUrl:"/series/mystery/e2.mp4"

      }

    ]

  });



  // ======================
  // NEWS
  // ======================


  await prisma.news.create({

    data:{

      channelId:cnn.id,

      title:"Breaking News Today",

      content:"World news update",

      image:"/news/world.jpg",

      videoUrl:"/news/live.mp4",

      type:"LIVE"

    }

  });



  // ======================
  // PROGRAMS
  // ======================


  const newsProgram = await prisma.program.create({

    data:{


      channelId:cnn.id,


      title:"Morning News",


      type:ProgramType.NEWS,


      sourceUrl:"rtsp://localhost:8554/cnn",


      allowAds:false,


      startTime:new Date("2026-06-20T06:00:00Z"),


      endTime:new Date("2026-06-20T08:00:00Z")

    }

  });




  const movieProgram = await prisma.program.create({

    data:{


      channelId:cnn.id,


      title:"Movie Time",


      type:ProgramType.MOVIE,


      movieId:movie.id,


      sourceUrl:"/videos/adventure.mp4",


      allowAds:true,


      startTime:new Date("2026-06-20T08:00:00Z"),


      endTime:new Date("2026-06-20T10:00:00Z")


    }

  });



  // ======================
  // ADVERTISEMENT
  // ======================


  const cocaAd = await prisma.advertisement.create({

    data:{


      title:"Coca Cola Advertisement",


      videoUrl:"/ads/coca-cola.mp4",


      duration:30


    }

  });



  await prisma.adPolicy.create({

    data:{


      programId:movieProgram.id,


      interval:15,


      enabled:true


    }

  });



  // ======================
  // PLAYLIST
  // ======================


  const playlist = await prisma.playlist.create({

    data:{


      name:"Evening Broadcast"

    }

  });



  await prisma.playlistItem.create({

    data:{


      playlistId:playlist.id,


      programId:movieProgram.id,


      order:1


    }

  });



  await prisma.playlistItem.create({

    data:{


      playlistId:playlist.id,


      programId:newsProgram.id,


      order:2


    }

  });

  // ======================
  // RECORDING
  // ======================


  await prisma.recording.create({

    data:{


      channelId:cnn.id,


      title:"CNN Morning Recording",


      fileUrl:"/recordings/cnn/news.mp4",


      duration:7200,


      startedAt:new Date("2026-06-20T06:00:00Z"),


      endedAt:new Date("2026-06-20T08:00:00Z")


    }

  });



  // ======================
  // CURRENT LIVE
  // ======================


  await prisma.broadcastSession.create({

    data:{


      channelId:cnn.id,


      programId:newsProgram.id,


      status:BroadcastStatus.LIVE,


      startedAt:new Date()

    }

  });



  console.log("Broadcast360 Seed Completed 🚀");

}



main()

.then(async()=>{

 await prisma.$disconnect();

 await pool.end();

})


.catch(async(e)=>{


 console.error(e);


 await prisma.$disconnect();


 await pool.end();


 process.exit(1);


});