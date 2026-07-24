export interface Movie {
  id: number;

  movieKey: string;

  title: string;

  description?: string | null;

  genre?: string | null;

  thumbnail?: string | null;

  videoUrl?: string | null;

  duration: number;

  releaseYear?: number | null;

  createdAt?: string | Date;


  // Channel

  channelId?: number;

  channelName?: string;



  // Playlist

  playlistId?: number;

  playlistItemId?: number;

  playlistOrder?: number;



  // Schedule

  scheduleId?: number;

  scheduleStart?: string;

  scheduleEnd?: string | null;
}