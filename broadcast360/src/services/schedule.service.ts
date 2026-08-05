import { ScheduleRepository } from "@/repositories/schedule.repository";
import { CreateScheduleDTO, UpdateScheduleDTO } from "@/types/schedule";
import { PlaylistRepository } from "@/repositories/playlist.repository";

function hasConflict(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

export const ScheduleService = {
  getPaginated: async (
    page: number,
    limit: number,
    search?: string,
    date?: string,
  ) => {
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.max(1, limit);

    const { data, total } = await ScheduleRepository.getPaginatedSchedules({
      page: validatedPage,
      limit: validatedLimit,
      search,
      date,
    });

    return {
      data,
      pagination: { page: validatedPage, limit: validatedLimit, total },
    };
  },

  getAll: () => ScheduleRepository.findAll(),
  getById: (id: number) => ScheduleRepository.findById(id),
  delete: (id: number) => ScheduleRepository.delete(id),

  create: async (dto: CreateScheduleDTO) => {
    const start = new Date(dto.startTime);

    const duration = await PlaylistRepository.getTotalDuration(dto.playlistId);

    let end: Date;

    // VOD playlist
    if (duration > 0) {
      end = new Date(start.getTime() + duration * 1000);
    }
    // LIVE stream / manual schedule
    else {
      if (!dto.endTime) {
        throw new Error("End time is required for live stream schedule");
      }

      end = new Date(dto.endTime);
    }

    const schedules = await ScheduleRepository.findByChannel(dto.channelId);

    const conflict = schedules.some((s) =>
      hasConflict(
        start,
        end,
        new Date(s.startTime),
        s.endTime ? new Date(s.endTime) : new Date(s.startTime),
      ),
    );

    if (conflict) {
      throw new Error(
        "Schedule time conflict detected. Another schedule already exists during this time.",
      );
    }

    return ScheduleRepository.create({
      channelId: dto.channelId,
      playlistId: dto.playlistId,
      startTime: start,
      endTime: end,
    });
  },

  update: async (id: number, dto: UpdateScheduleDTO) => {
    const existing = await ScheduleRepository.findById(id);

    if (!existing) {
      throw new Error("Schedule not found");
    }

    if (new Date(existing.startTime) <= new Date()) {
      throw new Error("Cannot update started or completed schedule");
    }

    const start = dto.startTime
      ? new Date(dto.startTime)
      : new Date(existing.startTime);

    const channelId = dto.channelId ?? existing.channelId;

    const playlistId = dto.playlistId ?? existing.playlistId;

    const duration = await PlaylistRepository.getTotalDuration(playlistId);

    let end: Date;

    // ==========================
    // VOD PLAYLIST
    // ==========================
    if (duration > 0) {
      end = new Date(start.getTime() + duration * 1000);
    }

    // ==========================
    // LIVE STREAM
    // ==========================
    else {
      const manualEnd = dto.endTime
        ? new Date(dto.endTime)
        : existing.endTime
          ? new Date(existing.endTime)
          : null;

      if (!manualEnd) {
        throw new Error("Live stream requires manual end time");
      }

      if (manualEnd <= start) {
        throw new Error("End time must be after start time");
      }

      end = manualEnd;
    }

    const schedules = await ScheduleRepository.findByChannel(channelId);

    const conflict = schedules.some((s) => {
      if (s.id === id) {
        return false;
      }

      return hasConflict(
        start,
        end,
        new Date(s.startTime),
        s.endTime ? new Date(s.endTime) : new Date(s.startTime),
      );
    });

    if (conflict) {
      throw new Error("Schedule update conflict detected.");
    }

    return ScheduleRepository.update(id, {
      channelId,

      playlistId,

      startTime: start,

      endTime: end,
    });
  },
};
