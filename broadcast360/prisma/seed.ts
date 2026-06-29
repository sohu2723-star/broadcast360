import {
  PrismaClient,
  Role,
  ProgramType,
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
  console.log('🌱 Starting database seeding...');

  // 1. CLEANUP (Optional but recommended: clears old data to prevent unique constraint issues)
  await prisma.recording.deleteMany();
  await prisma.broadcastSession.deleteMany();
  await prisma.playlistItem.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.adPolicy.deleteMany();
  await prisma.program.deleteMany();
  await prisma.advertisement.deleteMany();
  await prisma.news.deleteMany();
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
          name: `User ${i}`,
          email: `user${i}@example.com`,
          password: `hashed_password_${i}`, // Simple placeholder for seed
          role: i <= 2 ? Role.ADMIN : Role.GUEST, // 2 Admins, 8 Guests
        },
      })
    );
  }
  console.log('👥 Seeded 10 Users');

  // 3. CHANNELS
  const channels = [];
  const countries = ['USA', 'UK', 'Canada', 'France', 'Germany', 'Japan', 'South Korea', 'Australia', 'Brazil', 'India'];
  for (let i = 1; i <= 10; i++) {
    channels.push(
      await prisma.channel.create({
        data: {
          name: `Channel ${String.fromCharCode(64 + i)} Network`, // Channel A, B, C...
          description: `This is the official description for Channel ${String.fromCharCode(64 + i)}.`,
          logo: `/images/logo/channel_${i}.png`, // Placeholder path for logos
          country: countries[i - 1],
        },
      })
    );
  }
  console.log('📺 Seeded 10 Channels');

  // 4. LIVE STREAMS
  for (let i = 1; i <= 10; i++) {
    await prisma.stream.create({
      data: {
        channelId: channels[i - 1].id, // 1 stream per channel
        url: `rtmp://live.example.com/live/stream_${i}`,
        protocol: 'RTMP',
        status: i % 3 === 0 ? 'active' : 'offline',
      },
    });
  }
  console.log('⚡ Seeded 10 Live Streams');

  // 5. MOVIES
  const movies = [];
  for (let i = 1; i <= 10; i++) {
    movies.push(
      await prisma.movie.create({
        data: {
          title: `Blockbuster Movie Vol. ${i}`,
          description: `An action-packed cinematic masterpiece, volume ${i}.`,
          thumbnail: `images/movie_${i}.jpg`,
          videoUrl: `images/videos/movie_${i}.mp4`,
          duration: 5400 + i * 300, // Between 1.5 to 2.5 hours
          releaseYear: 2015 + i,
        },
      })
    );
  }
  console.log('🎬 Seeded 10 Movies');

  // 6. SERIES
  const allSeries = [];
  for (let i = 1; i <= 10; i++) {
    allSeries.push(
      await prisma.series.create({
        data: {
          title: `Hit Series: Season ${i}`,
          description: `The complete narrative arc for season ${i} of our flagship drama.`,
          thumbnail: `images/series_${i}.jpg`,
        },
      })
    );
  }
  console.log('🍿 Seeded 10 Series');

  // 7. EPISODES (Distributed across our 10 series)
  for (let i = 1; i <= 10; i++) {
    await prisma.episode.create({
      data: {
        seriesId: allSeries[Math.floor((i - 1) / 1)].id, // Maps smoothly across series
        title: `Episode Title ${i}`,
        episodeNo: ((i - 1) % 5) + 1, // Creates ep numbers like 1, 2, 3, 4, 5...
        duration: 2400, // 40 minutes
        videoUrl: `upload/videos/episode_${i}.mp4`,
      },
    });
  }
  console.log('🎞️ Seeded 10 Episodes');

  // 8. NEWS
  for (let i = 1; i <= 10; i++) {
    await prisma.news.create({
      data: {
        channelId: channels[i - 1].id,
        title: `Breaking News Update ${i}`,
        content: `Detailed journalistic reporting regarding global event number ${i}.`,
        image: `images/news/img_${i}.jpg`,
        videoUrl: i % 2 === 0 ? `videos/news/clip_${i}.mp4` : null,
        type: i % 2 === 0 ? 'live' : 'prepared',
      },
    });
  }
  console.log('📰 Seeded 10 News Articles');

  // 9. ADVERTISEMENTS
  for (let i = 1; i <= 10; i++) {
    await prisma.advertisement.create({
      data: {
        title: `Commercial Ad ${i}`,
        videoUrl: `videos/ads/ad_clip_${i}.mp4`,
        duration: i % 2 === 0 ? 30 : 15, // 15s or 30s ads
        active: true,
      },
    });
  }
  console.log('💰 Seeded 10 Advertisements');

  // 10. PROGRAMS (Broadcast Schedule)
  const programs = [];
  const programTypes = [ProgramType.MOVIE, ProgramType.SERIES, ProgramType.NEWS, ProgramType.LIVE, ProgramType.CAMERA];
  
  const baseTime = new Date('2026-07-01T00:00:00Z');

  for (let i = 1; i <= 10; i++) {
    const start = new Date(baseTime.getTime() + (i - 1) * 2 * 60 * 60 * 1000); // Cascades every 2 hours
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    programs.push(
      await prisma.program.create({
        data: {
          channelId: channels[i - 1].id,
          title: `Scheduled Program ${i}`,
          type: programTypes[(i - 1) % programTypes.length],
          sourceUrl: i % 3 === 0 ? `https://edge.stream.com/live/feed_${i}` : null,
          allowAds: i % 2 === 0,
          startTime: start,
          endTime: end,
          movieId: i <= 5 ? movies[i - 1].id : null, // Link first 5 programs to movies
        },
      })
    );
  }
  console.log('📅 Seeded 10 Programs');

  // 11. AD POLICIES (1-to-1 relation with Program)
  for (let i = 1; i <= 10; i++) {
    await prisma.adPolicy.create({
      data: {
        programId: programs[i - 1].id,
        interval: 15, // Play ads every 15 minutes
        enabled: i % 2 === 0,
      },
    });
  }
  console.log('🛡️ Seeded 10 Ad Policies');

  // 12. PLAYLISTS
  const playlists = [];
  for (let i = 1; i <= 10; i++) {
    playlists.push(
      await prisma.playlist.create({
        data: {
          name: `Daily Rotation Playlist ${i}`,
        },
      })
    );
  }
  console.log('🎵 Seeded 10 Playlists');

  // 13. PLAYLIST ITEMS
  for (let i = 1; i <= 10; i++) {
    await prisma.playlistItem.create({
      data: {
        playlistId: playlists[i - 1].id,
        programId: programs[i - 1].id,
        order: 1,
      },
    });
  }
  console.log('📌 Seeded 10 Playlist Items');

  // 14. BROADCAST SESSIONS
  const statuses = [BroadcastStatus.LIVE, BroadcastStatus.STOPPED, BroadcastStatus.SWITCHING];
  for (let i = 1; i <= 10; i++) {
    await prisma.broadcastSession.create({
      data: {
        channelId: channels[i - 1].id,
        programId: programs[i - 1].id,
        status: statuses[(i - 1) % statuses.length],
        startedAt: i % 3 !== 1 ? new Date() : null,
      },
    });
  }
  console.log('📡 Seeded 10 Broadcast Sessions');

  // 15. RECORDINGS
  for (let i = 1; i <= 10; i++) {
    await prisma.recording.create({
      data: {
        channelId: channels[i - 1].id,
        title: `Archived Broadcast Log #${i}`,
        fileUrl: `videos/records/channel_${i}_archive.mp4`,
        duration: 7200,
        startedAt: new Date('2026-06-20T12:00:00Z'),
        endedAt: new Date('2026-06-20T14:00:00Z'),
      },
    });
  }
  console.log('💾 Seeded 10 Recordings');

  console.log('🏁 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error while seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });