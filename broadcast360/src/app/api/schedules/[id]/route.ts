import { NextRequest, NextResponse } from "next/server";
import { ScheduleService } from "@/services/schedule.service";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const scheduleId = Number(id);

    if (isNaN(scheduleId) || scheduleId <= 0) {
      return NextResponse.json(
        { message: "Invalid Schedule ID" },
        { status: 400 }
      );
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        channel: true,
        playlist: {
          include: {
            program: true,
            items: {
              orderBy: { order: "asc" },
              include: {
                movie: true,
                episode: { include: { series: true } },
                advertisement: true,
                news: true,
                entertainment: true,
                stream: true,
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // Dynamic Playout Telemetry Calculation
    const now = new Date();
    const start = new Date(schedule.startTime);
    const end = schedule.endTime
      ? new Date(schedule.endTime)
      : new Date(start.getTime() + 30 * 60 * 1000); // 30m default fallback

    let computedStatus: "LIVE" | "PENDING" | "COMPLETED" = "PENDING";
    let elapsedMinutes = 0;
    let remainingMinutes = 0;
    let progressPercent = 0;

    const totalDurationMs = Math.max(end.getTime() - start.getTime(), 1);

    if (now >= end) {
      computedStatus = "COMPLETED";
      progressPercent = 100;
      elapsedMinutes = Math.round(totalDurationMs / 60000);
      remainingMinutes = 0;
    } else if (now >= start && now < end) {
      computedStatus = "LIVE";
      const elapsedMs = now.getTime() - start.getTime();
      const remainingMs = end.getTime() - now.getTime();

      elapsedMinutes = Math.floor(elapsedMs / 60000);
      remainingMinutes = Math.ceil(remainingMs / 60000);
      progressPercent = Math.min(
        100,
        Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100))
      );
    } else {
      computedStatus = "PENDING";
      progressPercent = 0;
      elapsedMinutes = 0;
      remainingMinutes = Math.round(totalDurationMs / 60000);
    }

    // Extracted Playlist Item Titles
    const itemTitles = (schedule.playlist?.items ?? [])
      .map((item) => {
        switch (item.type) {
          case "MOVIE":
            return item.movie?.title;
          case "EPISODE":
            return item.episode
              ? `${item.episode.series?.title ?? "Series"} S1:E${item.episode.episodeNo}`
              : null;
          case "ADVERTISEMENT":
            return item.advertisement?.title;
          case "NEWS":
            return item.news?.title;
          case "ENTERTAINMENT":
            return item.entertainment?.title;
          case "STREAM":
            return item.stream?.name;
          default:
            return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({
      id: `SCH-${schedule.id}`,
      dbId: schedule.id,
      channelName: schedule.channel?.name ?? "Primary Output Channel",
      programName: schedule.playlist?.program?.title ?? "General Program",
      playlistName: schedule.playlist?.name ?? "Default Playlist",
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      status: computedStatus,
      relationalKeys: {
        channelId: schedule.channelId,
        programId: schedule.playlist?.programId ?? null,
        playlistId: schedule.playlistId,
      },
      telemetry: {
        elapsedMinutes,
        remainingMinutes,
        progressPercent,
      },
      assetMeta: {
        codec: "H.264 / AAC",
        resolution: "1080p 60fps",
        bitrate: "12.5 Mbps",
        totalItems: schedule.playlist?.items.length ?? 0,
        itemTitles,
      },
    });
  } catch (error) {
    console.error("GET Schedule Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const scheduleId = Number(id);

    const body = await req.json();

    const { channelId, playlistId, startTime, endTime } = body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Database conflict checking efficiently in SQL
    const conflict = await prisma.schedule.findFirst({
      where: {
        channelId: Number(channelId),
        id: { not: scheduleId },
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json(
        {
          message:
            "Schedule conflict: another playlist exists in this time range.",
        },
        { status: 409 }
      );
    }

    const updatedSchedule = await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        channelId: Number(channelId),
        playlistId: Number(playlistId),
        startTime: start,
        endTime: end,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedSchedule,
    });
  } catch (error) {
    console.error("PUT Schedule Error:", error);
    return NextResponse.json(
      { message: "Failed to update schedule" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await ScheduleService.delete(Number(id));
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 }
    );
  }
}