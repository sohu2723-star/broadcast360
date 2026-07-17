export interface Series {
  id: number;

  title: string;

  description?: string | null;

  genre?: string | null;

  releaseYear?: number | null;

  thumbnail: string | null;

  latestEpisode: {
    id: number;

    title: string;

    episodeNo: number;

    duration: number;

    videoUrl: string | null;
  };

  channel: {
    id: number;

    name: string;
  };

  schedule: {
    id: number;

    startTime: string;

    endTime: string | null;
  };
}

export interface SeriesResponse {
  success: boolean;

  series: Series[];

  pagination: {
    page: number;

    limit: number;

    total: number;

    totalPages: number;
  };
}
