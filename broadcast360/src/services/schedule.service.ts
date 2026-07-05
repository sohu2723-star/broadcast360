import { ScheduleRepository } from "@/repositories/schedule.repository";
import { CreateScheduleDTO, UpdateScheduleDTO } from "@/types/schedule";

function hasConflict(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

export const ScheduleService = {
  getPaginated: async (page: number, limit: number, search?: string, date?: string) => {
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
    const conflict = schedules.find((s) =>
      hasConflict(start, end, new Date(s.startTime), new Date(s.endTime ?? s.startTime))
    );

    if (conflict) throw new Error("Schedule time conflict detected.");

    return ScheduleRepository.create({
      channelId: dto.channelId,
      playlistId: dto.playlistId,
      startTime: start,
      endTime: end,
    });
  },

  update: async (id: number, dto: UpdateScheduleDTO) => {
    const schedules = await ScheduleRepository.findByChannel(dto.channelId);

    const start = dto.startTime ? new Date(dto.startTime) : null;
    const end = dto.endTime ? new Date(dto.endTime) : null;

    if (start && end) {
      const conflict = schedules.find((s) => {
        if (s.id === id) return false; // Fixed: Don't compare with itself
        return hasConflict(start, end, new Date(s.startTime), new Date(s.endTime ?? s.startTime));
      });

      if (conflict) throw new Error("Schedule update conflict detected.");
    }

    return ScheduleRepository.update(id, {
      channelId: dto.channelId,
      playlistId: dto.playlistId,
      startTime: start ?? new Date(),
      endTime: end,
    });
  },
};