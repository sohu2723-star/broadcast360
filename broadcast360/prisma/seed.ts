import {
  PrismaClient,
  Role,
  ProgramType,
  PlaylistItemType,
  ScheduleStatus,
  BroadcastStatus
} from "../src/generated/prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";


const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
});


const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding with updated schema...');

  // 1. CLEANUP EXECUTED IN REVERSE RELATION ORDER
  await prisma.recording.deleteMany();
  await prisma.broadcastSession.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.playlistItem.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.program.deleteMany();
  await prisma.news.deleteMany();
  await prisma.advertisement.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.series.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.stream.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned up old records.');

  // 2. USERS
  const users = [];
  for (let i = 1; i <= 10; i++) {
    users.push(
      await prisma.user.create({
        data: {
          name: `Staff Member ${i}`,
          email: `staff${i}@broadcast.tv`,
          password: `secure_hash_password_${i}`,
          role: i <= 2 ? Role.ADMIN : Role.USER,
        },
      })
    );
  }
  console.log('👥 Seeded 10 Users');

  // 3. CHANNELS
  const channels = [];

const channelData = [
  {
    name: "BC360 SERIES",
    description: "Premium series streaming channel for BC360.",
    logo: "/logos/series.jpg",
    country: "Myanmar",
    streamKey: "bc360_series_key",
  },
  {
    name: "BC360 MOVIES",
    description: "Premium movie streaming channel for BC360.",
    logo: "/logos/movies.jpg",
    country: "USA",
    streamKey: "bc360_movies_key",
  },
  {
    name: "BC360 ENTERTAINMENTS",
    description: "Entertainment programs and shows channel for BC360.",
    logo: "/logos/entertainment.jpg",
    country: "South Korea",
    streamKey: "bc360_entertainments_key",
  },
  {
    name: "BC360 NEWS",
    description: "24/7 latest news broadcast channel for BC360.",
    logo: "/logos/news.jpg",
    country: "UK",
    streamKey: "bc360_news_key",
  },
  {
    name: "BC360 SPORTS",
    description: "Live sports events and sports programs channel for BC360.",
    logo: "/logos/sport.jpg",
    country: "Japan",
    streamKey: "bc360_sports_key",
  },
  {
    name: "BC360 KIDS",
    description: "Kids programs and educational content channel for BC360.",
    logo: "/logos/kid.jpg",
    country: "Australia",
    streamKey: "bc360_kids_key",
  },
];

for (const channel of channelData) {
  channels.push(
    await prisma.channel.create({
      data: channel,
    })
  );
}
  console.log('📺 Seeded 6 Channels');


  // 5. MOVIES
  const movies = [];

const movieData = [
  {
    title: "Avatar-Part1",
    description:
      "A paraplegic former Marine is sent to the alien moon Pandora, where humans seek to extract a valuable natural resource. Through an Avatar body, he becomes part of the Na'vi community and discovers the beauty of their world. Torn between duty and conscience, he must choose where his true loyalty lies.",
    genre: "Adventure",
    thumbnail: "/thumbnails/movies/AVA.jpg",
    videoUrl: "/videos/movies/AVA_Part1.mp4",
    duration: 120, // seconds
    releaseYear: 2015,
  },
  {
    title: "Avatar-Part2",
    description:
      "A paraplegic former Marine is sent to the alien moon Pandora, where humans seek to extract a valuable natural resource. Through an Avatar body, he becomes part of the Na'vi community and discovers the beauty of their world. Torn between duty and conscience, he must choose where his true loyalty lies.",
    genre: "Adventure",
    thumbnail: "/thumbnails/movies/AVA1.jpg",
    videoUrl: "/videos/movies/AVA_Part2.mp4",
    duration: 82, // seconds
    releaseYear: 2015,
  },
  {
    title: "Inception-Part1",
    description:
      "A skilled thief who specializes in stealing secrets through dream-sharing technology is offered a chance to erase his criminal past. His mission is not to steal an idea, but to plant one deep within a target's subconscious. As dreams become increasingly unstable, the team must navigate multiple layers of reality where every decision carries deadly consequences.",
    genre: "Action",
    thumbnail: "/thumbnails/movies/Inc.jpg",
    videoUrl: "/videos/movies/Inc_Part1.mp4",
    duration: 60, // seconds
    releaseYear: 2020,
  },
  {
    title: "Inception-Part2",
    description:
      "A skilled thief who specializes in stealing secrets through dream-sharing technology is offered a chance to erase his criminal past. His mission is not to steal an idea, but to plant one deep within a target's subconscious. As dreams become increasingly unstable, the team must navigate multiple layers of reality where every decision carries deadly consequences.",
    genre: "Action",
    thumbnail: "/thumbnails/movies/Inc1.jpg",
    videoUrl: "/videos/movies/Inc_Part2.mp4",
    duration: 83, // seconds
    releaseYear: 2020,
  },
  {
    title: "Interstellar-Part1",
    description:
      "In a future where Earth is becoming uninhabitable, a former NASA pilot joins a daring mission through a wormhole to find a new home for humanity. Facing black holes, distant planets, and the effects of time dilation, the crew must overcome impossible odds. The journey explores love, sacrifice, and survival across space and time.",
    genre: "Adventure",
    thumbnail: "/thumbnails/movies/In.jpg",
    videoUrl: "/videos/movies/Int_Part1.mp4",
    duration: 60, // seconds
    releaseYear: 2023,
  },
  {
    title: "Interstellar-Part2",
    description:
      "In a future where Earth is becoming uninhabitable, a former NASA pilot joins a daring mission through a wormhole to find a new home for humanity. Facing black holes, distant planets, and the effects of time dilation, the crew must overcome impossible odds. The journey explores love, sacrifice, and survival across space and time.",
    genre: "Adventure",
    thumbnail: "/thumbnails/movies/In1.jpg",
    videoUrl: "/videos/movies/Int_Part2.mp4",
    duration: 114, // seconds
    releaseYear: 2023,
  },
  {
    title: "The Dark Knight-Part1",
    description:
      "Batman continues his fight against crime in Gotham City while facing his most dangerous enemy yet—the Joker. As chaos spreads throughout the city, Batman is forced to make difficult moral choices that test his limits. The battle between justice and anarchy changes Gotham forever.",
    genre: "Drama",
    thumbnail: "/thumbnails/movies/DK.jpg",
    videoUrl: "/videos/movies/DK_Part1.mp4",
    duration: 120, // seconds
    releaseYear: 2020,
  },
  {
    title: "The Dark Knight-Part2",
    description:
      "Batman continues his fight against crime in Gotham City while facing his most dangerous enemy yet—the Joker. As chaos spreads throughout the city, Batman is forced to make difficult moral choices that test his limits. The battle between justice and anarchy changes Gotham forever.",
    genre: "Drama",
    thumbnail: "/thumbnails/movies/DK.jpg",
    videoUrl: "/videos/movies/DK_Part2.mp4",
    duration: 126, // seconds
    releaseYear: 2020,
  },
  {
    title: "Top Gun: Maverick-Part1",
    description:
      "After more than thirty years as one of the Navy's top aviators, Pete \"Maverick\" Mitchell returns to train a new generation of elite fighter pilots. As they prepare for a dangerous mission, Maverick confronts the ghosts of his past while inspiring the next generation to push beyond their limits.",
    genre: "Action",
    thumbnail: "/thumbnails/movies/TGM.jpg",
    videoUrl: "/videos/movies/TGM_Part1.mp4",
    duration: 120, // seconds
    releaseYear: 2025,
  },
  {
    title: "Top Gun: Maverick-Part2",
    description:
      "After more than thirty years as one of the Navy's top aviators, Pete \"Maverick\" Mitchell returns to train a new generation of elite fighter pilots. As they prepare for a dangerous mission, Maverick confronts the ghosts of his past while inspiring the next generation to push beyond their limits.",
    genre: "Action",
    thumbnail: "/thumbnails/movies/TGM.jpg",
    videoUrl: "/videos/movies/TGM_Part2.mp4",
    duration: 70, // seconds
    releaseYear: 2025,
  },

];

for (const movie of movieData) {
  movies.push(
    await prisma.movie.create({
      data: movie,
    })
  );
}
  console.log('🎬 Seeded 6 Movies');

  
  // 6. SERIES
  const allSeries = [];

const seriesData = [
  {
  title: "Fantastic Beasts",
  description:
    "Fantastic Beasts is a fantasy film series set in the Wizarding World and serves as a prequel to the Harry Potter story. The films follow magizoologist Newt Scamander while also exploring the rise of Gellert Grindelwald and the early life of Albus Dumbledore, expanding the franchise's history decades before Harry Potter's era.",
  genre: "Fantasy",
  releaseYear: 2016,
  thumbnail: "/thumbnails/series/FB.jpg",
},
{
  title: "Harry Potter",
  description:
    "Harry Potter, an orphaned boy, discovers on his eleventh birthday that he is a wizard. He enrolls at Hogwarts School of Witchcraft and Wizardry, where he forms lifelong friendships and learns powerful magic. As he grows older, Harry faces increasingly dangerous challenges while uncovering the truth about his past and confronting the dark wizard Lord Voldemort. His journey is one of courage, friendship, sacrifice, and the battle between good and evil.",
  genre: "Adventure",
  releaseYear: 2001,
  thumbnail: "/thumbnails/series/HP.jpg",
},
{
  title: "Maze Runner",
  description:
    "Maze Runner is a science-fiction action film series based on the novels by James Dashner. Released between 2014 and 2018, the trilogy became known for combining dystopian world-building, mystery, and survival-focused storytelling, attracting a large young adult audience.",
  genre: "Action",
  releaseYear: 2014,
  thumbnail: "/thumbnails/series/MR.jpg",
},
{
  title: "Ren:The Girl with the Mark",
  description:
    "Born with a mysterious mark on her wrist, a young woman discovers that it connects her to an ancient secret hidden for centuries. As powerful enemies begin hunting her, she joins unexpected allies to uncover the truth behind her destiny. Every revelation brings greater danger, forcing her to choose between protecting the people she loves and embracing the extraordinary power within her. Her journey becomes a race against time to stop a darkness that threatens the entire world.",
  genre: "Adventure",
  releaseYear: 2024,
  thumbnail: "/thumbnails/series/Ren.jpg",
},
{
  title: "The Hunger Games",
  description:
    "The Hunger Games is a dystopian film franchise based on novels by Suzanne Collins. Set in the nation of Panem, the series follows Katniss Everdeen's role in a deadly televised competition and a broader rebellion against an authoritarian government. It became one of the defining young-adult film franchises of the 2010s and achieved major global commercial success.",
  genre: "Action",
  releaseYear: 2020,
  thumbnail: "/thumbnails/series/HG.jpg",
},

  ];

for (const series of seriesData) {
  allSeries.push(
    await prisma.series.create({
      data: series,
    })
  );
}

  console.log('🍿 Seeded 5 Series');

  // 7. EPISODES
  const episodes = [];

const episodeData = [
  {
    seriesId: allSeries[0].id,
    title: "Fantastic Beasts-Part1",
    episodeNo: 1,
    duration: 60,
    thumbnailUrl: "/thumbnails/series/FB2.jpg",
    videoUrl: "/videos/series/FB_Episode1_Part1.mp4",
  },
  {
    seriesId: allSeries[0].id,
    title: "Fantastic Beasts-Part2",
    episodeNo: 1,
    duration: 98,
    thumbnailUrl: "/thumbnails/series/FB2.jpg",
    videoUrl: "/videos/series/FB_Episode1_Part2.mp4",
  },
  {
    seriesId: allSeries[0].id,
    title: "Fantastic Beasts-Part1",
    episodeNo: 2,
    duration: 157,
    thumbnailUrl: "/thumbnails/series/FB2.jpg",
    videoUrl: "/videos/series/FB_Episode2_Part1.mp4",
  },
  {
    seriesId: allSeries[0].id,
    title: "Fantastic Beasts-Part2",
    episodeNo: 2,
    duration: 76,
    thumbnailUrl: "/thumbnails/series/FB2.jpg",
    videoUrl: "/videos/series/FB_Episode2_Part2.mp4",
  },
  {
    seriesId: allSeries[1].id,
    title: "Harry Potter-Part1",
    episodeNo: 1,
    duration: 60,
    thumbnailUrl: "/thumbnails/series/HP1.jpg",
    videoUrl: "/videos/series/HP_Episode1_Part1.mp4",
  },
  {
    seriesId: allSeries[1].id,
    title: "Harry Potter-Part2",
    episodeNo: 1,
    duration: 98,
    thumbnailUrl: "/thumbnails/series/HP1.jpg",
    videoUrl: "/videos/series/HP_Episode1_Part2.mp4",
  },
  {
    seriesId: allSeries[1].id,
    title: "Harry Potter-Part1",
    episodeNo: 2,
    duration: 180,
    thumbnailUrl: "/thumbnails/series/HP2.jpg",
    videoUrl: "/videos/series/HP_Episode2_Part1.mp4",
  },
  {
    seriesId: allSeries[1].id,
    title: "Harry Potter-Part2",
    episodeNo: 2,
    duration: 157,
    thumbnailUrl: "/thumbnails/series/HP2.jpg",
    videoUrl: "/videos/series/HP_Episode2_Part2.mp4",
  },
  {
    seriesId: allSeries[1].id,
    title: "Harry Potter-Part3",
    episodeNo: 2,
    duration: 180,
    thumbnailUrl: "/thumbnails/series/HP2.jpg",
    videoUrl: "/videos/series/HP_Episode2_Part3.mp4",
  },
  {
    seriesId: allSeries[1].id,
    title: "Harry Potter-Part4",
    episodeNo: 2,
    duration: 180,
    thumbnailUrl: "/thumbnails/series/HP2.jpg",
    videoUrl: "/videos/series/HP_Episode2_Part4.mp4",
  },
   {
    seriesId: allSeries[1].id,
    title: "Harry Potter-Part5",
    episodeNo: 2,
    duration: 142,
    thumbnailUrl: "/thumbnails/series/HP2.jpg",
    videoUrl: "/videos/series/HP_Episode2_Part5.mp4",
  },
  {
  seriesId: allSeries[2].id,
  title: "Maze Runner-Part1",
  episodeNo: 1,
  duration: 60,
  thumbnailUrl: "/thumbnails/series/MR1.jpg",
  videoUrl: "/videos/series/MR_Episode1_Part1.mp4",
},
{
  seriesId: allSeries[2].id,
  title: "Maze Runner-Part2",
  episodeNo: 1,
  duration: 107,
  thumbnailUrl: "/thumbnails/series/MR1.jpg",
  videoUrl: "/videos/series/MR_Episode1_Part2.mp4",
},
{
  seriesId: allSeries[2].id,
  title: "Maze Runner-Part1",
  episodeNo: 2,
  duration: 180,
  thumbnailUrl: "/thumbnails/series/MR2.jpg",
  videoUrl: "/videos/series/MR_Episode2_Part1.mp4",
},
{
  seriesId: allSeries[2].id,
  title: "Maze Runner-Part2",
  episodeNo: 2,
  duration: 180,
  thumbnailUrl: "/thumbnails/series/MR2.jpg",
  videoUrl: "/videos/series/MR_Episode2_Part2.mp4",
},
{
  seriesId: allSeries[2].id,
  title: "Maze Runner-Part3",
  episodeNo: 2,
  duration: 257,
  thumbnailUrl: "/thumbnails/series/MR2.jpg",
  videoUrl: "/videos/series/MR_Episode2_Part3.mp4",
},
{
  seriesId: allSeries[3].id,
  title: "Ren:The Girl with the Mark-Part1",
  episodeNo: 1,
  duration: 180,
  thumbnailUrl: "/thumbnails/series/Ren1.jpg",
  videoUrl: "/videos/series/Ren_Episode1_Part1.mp4",
},
{
  seriesId: allSeries[3].id,
  title: "Ren:The Girl with the Mark-Part2",
  episodeNo: 1,
  duration: 180,
  thumbnailUrl: "/thumbnails/series/Ren1.jpg",
  videoUrl: "/videos/series/Ren_Episode1_Part2.mp4",
},
{
  seriesId: allSeries[3].id,
  title: "Ren:The Girl with the Mark-Part1",
  episodeNo: 1,
  duration: 180,
  thumbnailUrl: "/thumbnails/series/Ren1.jpg",
  videoUrl: "/videos/series/Ren_Episode1_Part3.mp4",
},
{
  seriesId: allSeries[3].id,
  title: "Ren:The Girl with the Mark-Part2",
  episodeNo: 1,
  duration: 128,
  thumbnailUrl: "/thumbnails/series/Ren1.jpg",
  videoUrl: "/videos/series/Ren_Episode1_Part4.mp4",
},
{
  seriesId: allSeries[3].id,
  title: "Ren:The Girl with the Mark-Part1",
  episodeNo: 2,
  duration: 180,
  thumbnailUrl: "/thumbnails/series/Ren2.jpg",
  videoUrl: "/videos/series/Ren_Episode2_Part1.mp4",
},
{
  seriesId: allSeries[3].id,
  title: "Ren:The Girl with the Mark-Part2",
  episodeNo: 2,
  duration: 180,
  thumbnailUrl: "/thumbnails/series/Ren2.jpg",
  videoUrl: "/videos/series/Ren_Episode2_Part2.mp4",
},
{
  seriesId: allSeries[3].id,
  title: "Ren:The Girl with the Mark-Part2",
  episodeNo: 2,
  duration: 239,
  thumbnailUrl: "/thumbnails/series/Ren2.jpg",
  videoUrl: "/videos/series/Ren_Episode2_Part3.mp4",
},
{
  seriesId: allSeries[4].id,
  title: "The Hunger Games-Part1",
  episodeNo: 1,
  duration: 60,
  thumbnailUrl: "/thumbnails/series/HG1.jpg",
  videoUrl: "/videos/series/HG_Episode1_Part1.mp4",
},
{
  seriesId: allSeries[4].id,
  title: "The Hunger Games-Part2",
  episodeNo: 1,
  duration: 84,
  thumbnailUrl: "/thumbnails/series/HG1.jpg",
  videoUrl: "/videos/series/HG_Episode1_Part2.mp4",
},
{
  seriesId: allSeries[4].id,
  title: "The Hunger Games-Part1",
  episodeNo: 2,
  duration: 120,
  thumbnailUrl: "/thumbnails/series/HG2.jpg",
  videoUrl: "/videos/series/HG_Episode2_Part1.mp4",
},
{
  seriesId: allSeries[4].id,
  title: "The Hunger Games-Part2",
  episodeNo: 2,
  duration: 157,
  thumbnailUrl: "/thumbnails/series/HG2.jpg",
  videoUrl: "/videos/series/HG_Episode2_Part2.mp4",
},
  ];

for (const episode of episodeData) {
  episodes.push(
    await prisma.episode.create({
      data: episode,
    })
  );
}

  console.log('🎞️ Seeded Episodes');

// 8. Entertainment
  const entertainments = [];
  const entertainmentData = [
    {
      title: "A Sky Full of Stars-Part 1",
      description:
        "Coldplay performs their hit song 'A Sky Full of Stars' live at River Plate Stadium, featuring an energetic crowd, stunning light effects, and an unforgettable concert atmosphere.",
      category: "Documentary",
      thumbnail: "/thumbnails/entertainments/Stars1.jpg",
      videoUrl: "/videos/entertainments/Stars_part1.mp4",
      duration: 120, // 2 minutes
      releaseYear: 2023,
    },
    {
      title: "A Sky Full of Stars-Part 2",
      description:
        "Coldplay performs their hit song 'A Sky Full of Stars' live at River Plate Stadium, featuring an energetic crowd, stunning light effects, and an unforgettable concert atmosphere.",
      category: "Documentary",
      thumbnail: "/thumbnails/entertainments/Stars2.jpg",
      videoUrl: "/videos/entertainments/Stars_part2.mp4",
      duration: 168, // 2 minutes 48 seconds
      releaseYear: 2023,
    },
    {
      title: "Guitar Solo Performance-Part 1",
      description:
        "A talented musician performs a famous song with a unique guitar arrangement, showing creativity, skill, and a fresh interpretation of a popular hit. This type of performance highlights the artist's musical talent and stage presence.",
      category: "Documentary",
      thumbnail: "/thumbnails/entertainments/guitar.jpg",
      videoUrl: "/videos/entertainments/Guitar_part1.mp4",
      duration: 180, // 3 minutes
      releaseYear: 2024,
    },
    {
      title: "Guitar Solo Performance-Part 2",
      description:
        "A talented musician performs a famous song with a unique guitar arrangement, showing creativity, skill, and a fresh interpretation of a popular hit. This type of performance highlights the artist's musical talent and stage presence.",
      category: "Documentary",
      thumbnail: "/thumbnails/entertainments/guitar1.jpg",
      videoUrl: "/videos/entertainments/Guitar_part2.mp4",
      duration: 178, // 2 minutes 58 seconds
      releaseYear: 2024,
    },
     {
      title: "Larva New Season-Part 1",
      description:
        "A funny animated cartoon series featuring Red and Yellow, two little larvae who experience crazy adventures, food battles, friendship moments, and slapstick comedy. The series is produced by TUBA Entertainment and became popular worldwide through short comedy episodes and Larva Island.",
      category: "Animation",
      thumbnail: "/thumbnails/entertainments/larva.jpg",
      videoUrl: "/videos/entertainments/larva_part1.mp4",
      duration: 120, // 2 minutes
      releaseYear: 2011,
    },
    {
      title: "Larva New Season-Part 2",
      description:
        "A funny animated cartoon series featuring Red and Yellow, two little larvae who experience crazy adventures, food battles, friendship moments, and slapstick comedy. The series is produced by TUBA Entertainment and became popular worldwide through short comedy episodes and Larva Island.",
      category: "Animation",
      thumbnail: "/thumbnails/entertainments/larva1.jpg",
      videoUrl: "/videos/entertainments/larva_part2.mp4",
      duration: 120, // 2 minutes
      releaseYear: 2011,
    },
    {
      title: "Larva New Season-Part 3",
      description:
        "A funny animated cartoon series featuring Red and Yellow, two little larvae who experience crazy adventures, food battles, friendship moments, and slapstick comedy. The series is produced by TUBA Entertainment and became popular worldwide through short comedy episodes and Larva Island.",
      category: "Animation",
      thumbnail: "/thumbnails/entertainments/larva2.jpg",
      videoUrl: "/videos/entertainments/larva_part3.mp4",
      duration: 102, // 1 minute 42 seconds
      releaseYear: 2011,
    },
    {
      title: "Tom & Jerry: Doctor Jerry in the House-Part 1",
      description:
        "Jerry becomes a little doctor and tries to take care of Tom in this funny classic cartoon clip. The episode features the famous cat-and-mouse rivalry with comedy, tricks, and unexpected situations. WB Kids provides official Tom & Jerry classic cartoon clips.",
      category: "Comedy",
      thumbnail: "/thumbnails/entertainments/T&J.jpg",
      videoUrl: "/videos/entertainments/T&J_part1.mp4",
      duration: 120, // 2 minutes
      releaseYear: 1940,
    },
    {
      title: "Tom & Jerry: Doctor Jerry in the House-Part 2",
      description:
        "Jerry becomes a little doctor and tries to take care of Tom in this funny classic cartoon clip. The episode features the famous cat-and-mouse rivalry with comedy, tricks, and unexpected situations. WB Kids provides official Tom & Jerry classic cartoon clips.",
      category: "Comedy",
      thumbnail: "/thumbnails/entertainments/T&J1.jpg",
      videoUrl: "/videos/entertainments/T&J_part2.mp4",
      duration: 159, // 2 minutes 39 seconds
      releaseYear: 1940,
    },
     {
      title: "UP Street Dance Magic-Part 1",
      description:
        "A powerful street dance performance by UP Street Dance Club during the UAAP Season 87 Street Dance Competition, featuring energetic choreography, teamwork, and creative stage presentation.",
      category: "Documentary",
      thumbnail: "/thumbnails/entertainments/dance.jpg",
      videoUrl: "/videos/entertainments/Dance_part1.mp4",
      duration: 180, // 3 minutes
      releaseYear: 2025,
    },
    {
      title: "UP Street Dance Magic-Part 2",
      description:
        "A powerful street dance performance by UP Street Dance Club during the UAAP Season 87 Street Dance Competition, featuring energetic choreography, teamwork, and creative stage presentation.",
      category: "Documentary",
      thumbnail: "/thumbnails/entertainments/dance1.jpg",
      videoUrl: "/videos/entertainments/Dance_part2.mp4",
      duration: 137, // 2 minutes 17 seconds
      releaseYear: 2025,
    },
  ];

  for (const entertainment of entertainmentData) {    entertainments.push(
      await prisma.entertainment.create({
        data: entertainment,
      }),
    );
  }

  console.log("🎭 Seeded 5 Entertainments");

 
// 8. ADVERTISEMENTS
  const advertisements = [];

  const advertisementData = [
    {
      title: "Premium Beef Flavor",
      videoUrl: "/videos/ads/ad1.mp4",
      thumbnailUrl: "/thumbnails/ads/ads1.jpg",
      duration: 17, // 17 seconds
      active: true,
    },
    {
      title: "Fresh Chicken Choice",
      videoUrl: "/videos/ads/ad2.mp4",
      thumbnailUrl: "/thumbnails/ads/ads2.jpg",
      duration: 30, // 30 seconds
      active: true,
    },
    {
      title: "UP Scola Green Syrup",
      videoUrl: "/videos/ads/ad3.mp4",
      thumbnailUrl: "/thumbnails/ads/ads3.jpg",
      duration: 40, // 40 seconds
      active: true,
    },
    {
      title: "Tanjara Indian Allspice",
      videoUrl: "/videos/ads/ads4.mp4",
      thumbnailUrl: "/thumbnails/ads/ads4.jpg",
      duration: 60, // 1minute
      active: true,
    },
    {
      title: "Creamy Chocolate Treat",
      videoUrl: "/videos/ads/ads5.mp4",
      thumbnailUrl: "/thumbnails/ads/ads5.jpg",
      duration: 41, // 41 seconds
      active: true,
    },
  ];

  for (const advertisement of advertisementData) {
    advertisements.push(
      await prisma.advertisement.create({
        data: advertisement,
      }),
    );
  }

  console.log("💰 Seeded 5 Advertisements");


   console.log('🏁 Seeding execution successfully concluded!');
}
main()
  .catch((e) => {
    console.error('❌ Error executing database seed process:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });