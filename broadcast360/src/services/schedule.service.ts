import {
  getPaginatedSchedules,
  getScheduleById,
  deleteSchedule,
} from "@/repositories/schedule.repository";

// PAGINATION
export async function fetchPaginatedSchedules(
  page: number,
  limit: number,
  search?: string,
  date?: string
) {
  const validatedPage = Math.max(1, page);
  const validatedLimit = Math.max(1, limit);

  const { data, total } = await getPaginatedSchedules({
    page: validatedPage,
    limit: validatedLimit,
    search,
    date,
  });

  return {
    data,
    pagination: {
      page: validatedPage,
      limit: validatedLimit,
      total,
    },
  };
}

// BY ID
export function fetchScheduleById(id: number) {
  return getScheduleById(id);
}

// DELETE
export function removeSchedule(id: number) {
  return deleteSchedule(id);
}