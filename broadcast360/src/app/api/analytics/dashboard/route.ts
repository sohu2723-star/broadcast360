import { NextRequest, NextResponse } from "next/server";

import { getAdminFromRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const MAX_DAYS = 90;

type Row = Record<string, string | number | Date | bigint | null>;

function numberValue(value: unknown) {
  return typeof value === "bigint" ? Number(value) : Number(value ?? 0);
}

function isoDay(value: unknown) {
  return new Date(value as string | Date).toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ success: false, message: "Admin access required" }, { status: 401 });
  }

  try {
    const requestedDays = Number(request.nextUrl.searchParams.get("days") ?? 30);
    const days = Number.isInteger(requestedDays) ? Math.min(MAX_DAYS, Math.max(7, requestedDays)) : 30;
    const now = new Date();
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const activeViewerCutoff = new Date(now.getTime() - 5 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      bannedUsers,
      premiumUsers,
      totalChannels,
      totalMovies,
      liveStreams,
      channels,
      recentChannels,
      recentSessions,
      activityRows,
      popularChannels,
      mostWatched,
      mostFavourite,
      peakHours,
      activeLiveViewers,
      liveSessions24h,
      advertisementPerformance,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { status: "INACTIVE" } }),
      prisma.user.count({ where: { status: "BANNED" } }),
      prisma.subscription.findMany({
        where: { status: "ACTIVE" },
        distinct: ["userId"],
        select: { userId: true },
        take: 100000,
      }),
      prisma.channel.count(),
      prisma.movie.count(),
      prisma.broadcastSession.count({ where: { status: "LIVE" } }),
      prisma.channel.findMany({
        select: {
          id: true,
          name: true,
          broadcastSessions: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true } },
        },
        orderBy: { name: "asc" },
        take: 250,
      }),
      prisma.channel.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { name: true, createdAt: true } }),
      prisma.broadcastSession.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { status: true, createdAt: true, channel: { select: { name: true } } },
      }),
      prisma.$queryRaw<Row[]>`
        SELECT DATE_TRUNC('day', "watchedAt") AS day,
               COUNT(DISTINCT "userId")::int AS active_users,
               COUNT(*)::int AS watch_events
        FROM "WatchHistory"
        WHERE "watchedAt" >= ${start}
        GROUP BY DATE_TRUNC('day', "watchedAt")
        ORDER BY day ASC
        LIMIT 90
      `,
      prisma.$queryRaw<Row[]>`
        SELECT "channelId", "channelName", COUNT(*)::int AS views,
               COUNT(DISTINCT "userId")::int AS unique_users
        FROM (
          SELECT wh."userId", wh."watchedAt", c."id" AS "channelId", c."name" AS "channelName"
          FROM "WatchHistory" wh
          JOIN "PlaylistItem" pi ON pi."id" = wh."playlistItemId"
          JOIN "Playlist" pl ON pl."id" = pi."playlistId"
          JOIN "Program" pr ON pr."id" = pl."programId"
          JOIN "Channel" c ON c."id" = pr."channelId"
          WHERE wh."watchedAt" >= ${start}
          UNION ALL
          SELECT wh."userId", wh."watchedAt", c."id" AS "channelId", c."name" AS "channelName"
          FROM "WatchHistory" wh
          JOIN "News" n ON n."id" = wh."newsId"
          JOIN "Channel" c ON c."id" = n."channelId"
          WHERE wh."watchedAt" >= ${start}
        ) source
        GROUP BY "channelId", "channelName"
        ORDER BY views DESC
        LIMIT 10
      `,
      prisma.$queryRaw<Row[]>`
        SELECT "contentType", "contentId", title, COUNT(*)::int AS views,
               COUNT(DISTINCT "userId")::int AS unique_users
        FROM (
          SELECT wh."userId", 'MOVIE' AS "contentType", m."id" AS "contentId", m."title" AS title
          FROM "WatchHistory" wh
          JOIN "PlaylistItem" pi ON pi."id" = wh."playlistItemId"
          JOIN "Movie" m ON m."id" = pi."movieId"
          WHERE wh."watchedAt" >= ${start}
          UNION ALL
          SELECT wh."userId", 'EPISODE' AS "contentType", e."id" AS "contentId", e."title" AS title
          FROM "WatchHistory" wh
          JOIN "PlaylistItem" pi ON pi."id" = wh."playlistItemId"
          JOIN "Episode" e ON e."id" = pi."episodeId"
          WHERE wh."watchedAt" >= ${start}
          UNION ALL
          SELECT wh."userId", 'ENTERTAINMENT' AS "contentType", en."id" AS "contentId", en."title" AS title
          FROM "WatchHistory" wh
          JOIN "PlaylistItem" pi ON pi."id" = wh."playlistItemId"
          JOIN "Entertainment" en ON en."id" = pi."entertainmentId"
          WHERE wh."watchedAt" >= ${start}
          UNION ALL
          SELECT wh."userId", 'NEWS' AS "contentType", n."id" AS "contentId", n."title" AS title
          FROM "WatchHistory" wh
          JOIN "News" n ON n."id" = wh."newsId"
          WHERE wh."watchedAt" >= ${start}
        ) source
        GROUP BY "contentType", "contentId", title
        ORDER BY views DESC
        LIMIT 10
      `,
      prisma.$queryRaw<Row[]>`
        SELECT "contentType", "contentId", title, COUNT(*)::int AS favourites,
               COUNT(DISTINCT "userId")::int AS unique_users
        FROM (
          SELECT f."userId", 'MOVIE' AS "contentType", m."id" AS "contentId", m."title" AS title
          FROM "Favorite" f JOIN "Movie" m ON m."id" = f."movieId"
          WHERE f."createdAt" >= ${start}
          UNION ALL
          SELECT f."userId", 'EPISODE' AS "contentType", e."id" AS "contentId", e."title" AS title
          FROM "Favorite" f JOIN "Episode" e ON e."id" = f."episodeId"
          WHERE f."createdAt" >= ${start}
          UNION ALL
          SELECT f."userId", 'ENTERTAINMENT' AS "contentType", en."id" AS "contentId", en."title" AS title
          FROM "Favorite" f JOIN "Entertainment" en ON en."id" = f."entertainmentId"
          WHERE f."createdAt" >= ${start}
          UNION ALL
          SELECT f."userId", 'NEWS' AS "contentType", n."id" AS "contentId", n."title" AS title
          FROM "Favorite" f JOIN "News" n ON n."id" = f."newsId"
          WHERE f."createdAt" >= ${start}
        ) source
        GROUP BY "contentType", "contentId", title
        ORDER BY favourites DESC
        LIMIT 10
      `,
      prisma.$queryRaw<Row[]>`
        SELECT EXTRACT(HOUR FROM "watchedAt")::int AS hour, COUNT(*)::int AS views
        FROM "WatchHistory"
        WHERE "watchedAt" >= ${start}
        GROUP BY EXTRACT(HOUR FROM "watchedAt")
        ORDER BY hour ASC
        LIMIT 24
      `,
      prisma.$queryRaw<Row[]>`
        SELECT l."channelId", c."name" AS "channelName", COUNT(DISTINCT l."viewerKey")::int AS viewers
        FROM "LiveViewerSession" l
        JOIN "Channel" c ON c."id" = l."channelId"
        WHERE l."lastSeenAt" >= ${activeViewerCutoff} AND l."endedAt" IS NULL
        GROUP BY l."channelId", c."name"
        ORDER BY viewers DESC
        LIMIT 50
      `,
      prisma.liveViewerSession.count({ where: { startedAt: { gte: last24Hours } } }),
      prisma.$queryRaw<Row[]>`
        SELECT a."id", a."title",
          COUNT(e."id") FILTER (WHERE e."eventType" = 'IMPRESSION')::int AS impressions,
          COUNT(e."id") FILTER (WHERE e."eventType" = 'COMPLETE')::int AS completions,
          COUNT(e."id") FILTER (WHERE e."eventType" = 'CLICK')::int AS clicks
        FROM "Advertisement" a
        LEFT JOIN "AdvertisementEvent" e
          ON e."advertisementId" = a."id" AND e."occurredAt" >= ${start}
        GROUP BY a."id", a."title"
        ORDER BY impressions DESC, a."title" ASC
        LIMIT 10
      `,
    ]);

    const activeViewerTotal = activeLiveViewers.reduce((sum, row) => sum + numberValue(row.viewers), 0);

    return NextResponse.json({
      success: true,
      generatedAt: now.toISOString(),
      rangeDays: days,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        bannedUsers,
        premiumUsers: premiumUsers.length,
        totalChannels,
        liveStreams,
        movies: totalMovies,
      },
      userActivity: activityRows.map((row) => ({
        day: isoDay(row.day),
        activeUsers: numberValue(row.active_users),
        watchEvents: numberValue(row.watch_events),
      })),
      popularChannels: popularChannels.map((row) => ({
        channelId: numberValue(row.channelId),
        name: String(row.channelName ?? "Unknown"),
        views: numberValue(row.views),
        uniqueUsers: numberValue(row.unique_users),
      })),
      mostWatched: mostWatched.map((row) => ({
        type: String(row.contentType),
        contentId: numberValue(row.contentId),
        title: String(row.title ?? "Untitled"),
        views: numberValue(row.views),
        uniqueUsers: numberValue(row.unique_users),
      })),
      mostFavourite: mostFavourite.map((row) => ({
        type: String(row.contentType),
        contentId: numberValue(row.contentId),
        title: String(row.title ?? "Untitled"),
        favourites: numberValue(row.favourites),
        uniqueUsers: numberValue(row.unique_users),
      })),
      peakWatchingTime: peakHours.map((row) => ({ hour: numberValue(row.hour), views: numberValue(row.views) })),
      liveBroadcastViewers: {
        activeViewers: activeViewerTotal,
        sessionsLast24h: liveSessions24h,
        channels: activeLiveViewers.map((row) => ({
          channelId: numberValue(row.channelId),
          name: String(row.channelName ?? "Unknown"),
          viewers: numberValue(row.viewers),
        })),
      },
      advertisementPerformance: advertisementPerformance.map((row) => {
        const impressions = numberValue(row.impressions);
        const completions = numberValue(row.completions);
        return {
          advertisementId: numberValue(row.id),
          title: String(row.title ?? "Untitled"),
          impressions,
          completions,
          clicks: numberValue(row.clicks),
          completionRate: impressions > 0 ? Math.round((completions / impressions) * 1000) / 10 : 0,
        };
      }),
      channels: channels.map((channel) => ({ name: channel.name, status: channel.broadcastSessions[0]?.status ?? "STOPPED" })),
      activities: [
        ...recentChannels.map((channel) => ({ message: `Added channel ${channel.name}`, time: channel.createdAt })),
        ...recentSessions.map((session) => ({ message: `${session.channel.name} broadcast ${session.status.toLowerCase()}`, time: session.createdAt })),
      ],
    });
  } catch (error) {
    console.error("ADMIN ANALYTICS ERROR:", error);
    return NextResponse.json({ success: false, message: "Analytics data could not be loaded" }, { status: 500 });
  }
}
