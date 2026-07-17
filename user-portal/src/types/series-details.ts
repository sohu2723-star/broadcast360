export interface Episode {
  id: number;

  title: string;

  episodeNo: number;

  duration: number;

  thumbnail: string | null;

  videoUrl: string | null;

  channel: {
    id: number;
    name: string;
  };
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
