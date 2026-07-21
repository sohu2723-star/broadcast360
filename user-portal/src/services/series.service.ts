import api from "@/lib/api";
import type { SeriesResponse } from "@/types/series";

interface GetSeriesParams {
  page?: number;
  limit?: number;
  search?: string;
  channelId?: number;
  type?: "hot" | "all";
}

export class SeriesService {
  static async getSeries(params?: GetSeriesParams): Promise<SeriesResponse> {
    try {
      const query = new URLSearchParams();

      if (params?.page) {
        query.append("page", params.page.toString());
      }

      if (params?.limit) {
        query.append("limit", params.limit.toString());
      }

      if (params?.search) {
        query.append("search", params.search);
      }

      if (params?.channelId) {
        query.append("channelId", params.channelId.toString());
      }

      if (params?.type) {
        query.append("type", params.type);
      }

      const response = await api.get(
        `/api/user-portal/series?${query.toString()}`,
      );

      return response.data;
    } catch (error) {
      console.error("Failed to fetch series:", error);

      throw error;
    }
  }

  static async getSeriesById(id: number) {
    try {
      const response = await api.get(`/api/user-portal/series/${id}`);

      return response.data;
    } catch (error) {
      console.error("Failed to fetch series detail:", error);

      throw error;
    }
  }

  static async getRelatedSeries(id: number) {
    try {
      const response = await api.get(`/api/user-portal/series/${id}/related`);

      return response.data.series;
    } catch (error) {
      console.error("Failed to fetch related series:", error);

      throw error;
    }
  }
}
