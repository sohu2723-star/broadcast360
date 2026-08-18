
import api from "@/lib/api";
import { ADMIN_API_URL } from "@/services/apiConfig";

export interface ScheduleChannel {
  id: number;
  name: string;
  logo?: string | null;
}

export interface SchedulePlaylist {
  id: number;
  name: string;
}

export interface Schedule {
  id: number;
  channelId: number;
  playlistId: number;
  startTime: string;
  endTime: string | null;

  status:
    | "SCHEDULED"
    | "LIVE"
    | "COMPLETED"
    | "CANCELLED";

  channel: ScheduleChannel;
  playlist: SchedulePlaylist;
}

export interface SchedulePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ScheduleResponse {
  data: Schedule[];
  pagination: SchedulePagination;
  dateRange?: {
    from: string;
    to: string;
  };
}

/**
 * =====================================================
 * BACKEND LOGO URL
 * =====================================================
 *
 * Backend may return:
 *
 * /logos/news.jpg
 *
 * Convert to:
 *
 * http://backend:port/logos/news.jpg
 */
function getLogoUrl(
  logo?: string | null,
): string | null {
  if (!logo) {
    return null;
  }

  // Already a complete URL
  if (
    logo.startsWith("http://") ||
    logo.startsWith("https://")
  ) {
    return logo;
  }

  return `${ADMIN_API_URL.replace(
    /\/$/,
    "",
  )}/${logo.replace(/^\//, "")}`;
}

export async function getPremiumSchedules(
  page = 1,
  limit = 10,
  channelId?: number | null,
): Promise<ScheduleResponse> {
  const response = await api.get<ScheduleResponse>(
    "/api/user-portal/schedules",
    {
      params: {
        page,
        limit,
        ...(channelId ? { channelId } : {}),
      },

      withCredentials: true,
    },
  );

  const data = response.data;

  /**
   * =====================================================
   * ONLY FIX LOGO URL
   * =====================================================
   *
   * Everything else remains unchanged.
   */
  return {
    ...data,

    data: data.data.map((schedule) => ({
      ...schedule,

      channel: {
        ...schedule.channel,

        logo: getLogoUrl(
          schedule.channel?.logo,
        ),
      },
    })),
  };
}
