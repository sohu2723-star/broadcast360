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
          role: i <= 2 ? Role.ADMIN : Role.GUEST,
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
          name: `Channel ${String.fromCharCode(64 + i)} Network`,
          description: `Prime broadcast television feed for Channel ${String.fromCharCode(64 + i)}.`,
          logo: `/logos/channel_${i}.png`,
          country: countries[i - 1],
          streamKey: `live_key_stream_secret_${i}`,
        },
      })
    );
  }
  console.log('📺 Seeded 10 Channels');

  // 4. STREAM INPUTS
  const streams = [];
  for (let i = 1; i <= 10; i++) {
    streams.push(
      await prisma.stream.create({
        data: {
          channelId: channels[i - 1].id,
          name: `Stream ${i}`, // Added "name" because it's required (String) in your schema!
          url: `rtmp://ingest.server.com/live/stream_${i}`,
          protocol: 'RTMP', // Matches the exact uppercase Enum
          status: i % 2 === 0 ? 'ONLINE' : 'OFFLINE', // Matches your exact Enum values
        },
      })
    );
  }
  console.log('⚡ Seeded 10 Streams');

  // 5. MOVIES
  const movies = [];
  for (let i = 1; i <= 10; i++) {
    movies.push(
      await prisma.movie.create({
        data: {
          title: `Feature Movie ${i}`,
          description: `An cinematic presentation tracking story arc ${i}.`,
          genre: i % 2 === 0 ? 'Action' : 'Drama',
          thumbnail: `/thumbnails/movies/movie_${i}.png`,
          videoUrl: `/videos/movie_${i}.mp4`,
          duration: 7200, // 2 hours
          releaseYear: 2020 + i,
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
          title: `Drama Series Season ${i}`,
          description: `Seasonal broadcast package containing ongoing episodic stories.`,
          genre: 'Comedy',
          releaseYear: 2025,
          thumbnail: `/thumbnails/series/series_${i}.jpeg`,
        },
      })
    );
  }
  console.log('🍿 Seeded 10 Series');

  // 7. EPISODES
  const episodes = [];
  for (let i = 1; i <= 10; i++) {
    episodes.push(
      await prisma.episode.create({
        data: {
          seriesId: allSeries[i - 1].id,
          title: `Episode ${i}: The Beginning`,
          episodeNo: 1,
          duration: 3600, // 1 hour
          thumbnailUrl: `/thumbnails/episodes/episode_${i}.png`,
          videoUrl: `/videos/episodes/episode_${i}.mp4`,
        },
      })
    );
  }
  console.log('🎞️ Seeded 10 Episodes');

  // 8. ADVERTISEMENTS
  const advertisements = [];
  for (let i = 1; i <= 10; i++) {
    advertisements.push(
      await prisma.advertisement.create({
        data: {
          title: `Sponsor Commercial Advertisement ${i}`,
          videoUrl: `/videos/ads/ad_${i}.mp4`,
          thumbnailUrl: `/thumbnails/ads/ad_${i}.png`,
          duration: 30, // 30 seconds
          active: true,
        },
      })
    );
  }
  console.log('💰 Seeded 10 Advertisements');

  // 9. NEWS
  const newsItems = [];
  for (let i = 1; i <= 10; i++) {
    newsItems.push(
      await prisma.news.create({
        data: {
          channelId: channels[i - 1].id,
          title: `Global News Bulletin ${i}`,
          content: `Breaking investigative journalism reporting item ${i}.`,
          image: `/thumbnails/movies/news_${i}.png`,
          videoUrl: `/videos/news_report_${i}.mp4`,
          type: i % 2 === 0 ? 'LIVE' : 'PREPARED',
        },
      })
    );
  }
  console.log('📰 Seeded 10 News items');

  // 10. PROGRAMS
  const programs = [];
  const types = [ProgramType.MOVIE, ProgramType.SERIES, ProgramType.NEWS, ProgramType.LIVE, ProgramType.ENTERTAINMENT];
  for (let i = 1; i <= 10; i++) {
    programs.push(
      await prisma.program.create({
        data: {
          channelId: channels[i - 1].id,
          title: `Show Slot ${i}`,
          type: types[(i - 1) % types.length],
          description: `Main scheduled block wrapper description ${i}.`,
        },
      })
    );
  }
  console.log('📺 Seeded 10 Programs');

  // 11. PLAYLISTS
  const playlists = [];
  for (let i = 1; i <= 10; i++) {
    playlists.push(
      await prisma.playlist.create({
        data: {
          name: `Daily Schedule Block Automation Playlist ${i}`,
          programId: programs[i - 1].id,
          totalDuration: 10830, // Aggregate mapping
        },
      })
    );
  }
  console.log('🎵 Seeded 10 Playlists');

  // 12. PLAYLIST ITEMS
  const itemTypes = [
    PlaylistItemType.MOVIE,
    PlaylistItemType.EPISODE,
    PlaylistItemType.ADVERTISEMENT,
    PlaylistItemType.NEWS,
    PlaylistItemType.STREAM
  ];

  for (let i = 1; i <= 10; i++) {
    const itemType = itemTypes[(i - 1) % itemTypes.length];
    await prisma.playlistItem.create({
      data: {
        playlistId: playlists[i - 1].id,
        order: 1,
        type: itemType,
        // Polymorphic relation setup using individual conditions
        movieId: itemType === PlaylistItemType.MOVIE ? movies[i - 1].id : null,
        episodeId: itemType === PlaylistItemType.EPISODE ? episodes[i - 1].id : null,
        advertisementId: itemType === PlaylistItemType.ADVERTISEMENT ? advertisements[i - 1].id : null,
        newsId: itemType === PlaylistItemType.NEWS ? newsItems[i - 1].id : null,
        streamId: itemType === PlaylistItemType.STREAM ? streams[i - 1].id : null,
        duration: itemType === PlaylistItemType.ADVERTISEMENT ? 30 : 3600,
      },
    });
  }
  console.log('📌 Seeded 10 Playlist Items');

  // 13. SCHEDULES
  const schedules = [];
  const baseTime = new Date('2026-07-01T06:00:00Z');
  const schedStatuses = [ScheduleStatus.SCHEDULED, ScheduleStatus.LIVE, ScheduleStatus.COMPLETED, ScheduleStatus.CANCELLED];

  for (let i = 1; i <= 10; i++) {
    const start = new Date(baseTime.getTime() + (i - 1) * 3 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);

    schedules.push(
      await prisma.schedule.create({
        data: {
          channelId: channels[i - 1].id,
          playlistId: playlists[i - 1].id,
          startTime: start,
          endTime: end,
          status: schedStatuses[(i - 1) % schedStatuses.length],
        },
      })
    );
  }
  console.log('📅 Seeded 10 Schedules');

  // 14. BROADCAST SESSIONS
  const sessionStatuses = [BroadcastStatus.LIVE, BroadcastStatus.STOPPED, BroadcastStatus.SWITCHING];
  for (let i = 1; i <= 10; i++) {
    await prisma.broadcastSession.create({
      data: {
        channelId: channels[i - 1].id,
        scheduleId: schedules[i - 1].id,
        status: sessionStatuses[(i - 1) % sessionStatuses.length],
        startedAt: i % 2 === 0 ? new Date() : null,
      },
    });
  }
  console.log('📡 Seeded 10 Broadcast Sessions');

  // 15. RECORDINGS
  for (let i = 1; i <= 10; i++) {
    await prisma.recording.create({
      data: {
        channelId: channels[i - 1].id,
        title: `DVR Archive Recording Record #${i}`,
        fileUrl: `videos/archive_channel_${i}.mp4`,
        duration: 10800,
        startedAt: new Date('2026-06-28T01:00:00Z'),
        endedAt: new Date('2026-06-28T04:00:00Z'),
      },
    });
  }

  console.log('💾 Seeded 10 Recordings');

  // 8. Entertainment
  const entertainments = [];
  for (let i = 1; i <= 10; i++) {
    entertainments.push(
      await prisma.entertainment.create({
        data: {
          title: `Entertainment Item ${i}`,
          description: `An cinematic presentation tracking story arc ${i}.`,
          category: i % 2 === 0 ? 'Talent Show' : 'Cooking Show',
          videoUrl: `/videos/entertainment/entertainment_${i}.mp4`,
          thumbnail: `/thumbnails/entertainment/entertainment_${i}.png`,
          duration: 1800, // 30 minutes
        },
      })
    );
  }
  console.log('🎮 Seeded 10 Entertainment Items');

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