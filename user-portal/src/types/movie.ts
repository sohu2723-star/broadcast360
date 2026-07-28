export interface Movie {
  id: number;

  movieKey: string;

  title: string;

  description?: string | null;

  genre?: string | null;

  releaseYear?: number | null;

  thumbnail?: string | null;

  videoUrl?: string | null;

  duration: number;


  channelId?: number | null;

  channelName?: string;


  playlistId?: number;

  playlistName?: string;


  scheduleId?: number;

  scheduleStart?: string | null;

  scheduleEnd?: string | null;
}