export interface EpisodePart {
  id: number;

  title: string;

  duration: number;

  thumbnail: string | null;

  videoUrl: string | null;
}

export interface Episode {
  id: number;

  title: string;

  episodeNo: number;

  channel: {
    id: number;
    name: string;
  };

  schedule: {
    id: number;
    startTime: string;
    endTime: string;
  };

  parts: EpisodePart[];
}

export interface SeriesDetail {
  id: number;

  title: string;

  description: string | null;

  genre: string | null;

  releaseYear: number | null;

  thumbnail: string | null;

  latestEpisode: Episode;

  episodes: Episode[];
}
