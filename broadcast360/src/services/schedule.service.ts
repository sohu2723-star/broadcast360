import { ScheduleRepository } from "@/repositories/schedule.repository";
import { CreateScheduleDTO, UpdateScheduleDTO } from "@/types/schedule";

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
    const end = new Date(dto.endTime);

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

    const start = dto.startTime
      ? new Date(dto.startTime)
      : new Date(existing.startTime);

    const end = dto.endTime
      ? new Date(dto.endTime)
      : existing.endTime
        ? new Date(existing.endTime)
        : null;

    const schedules = await ScheduleRepository.findByChannel(
      dto.channelId ?? existing.channelId,
    );

    const conflict = schedules.some((s) => {
      if (s.id === id) return false;

      return hasConflict(
        start,
        end!,
        new Date(s.startTime),
        new Date(s.endTime!),
      );
    });

    if (conflict) {
      throw new Error("Schedule update conflict detected.");
    }

    return ScheduleRepository.update(id, {
      channelId: dto.channelId ?? existing.channelId,
      playlistId: dto.playlistId ?? existing.playlistId,
      startTime: start,
      endTime: end,
    });
  },
};
