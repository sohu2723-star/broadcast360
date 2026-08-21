export interface Movie {
  id: number;

  movieKey: string;

  title: string;

  description?: string | null;

  genre?: string | null;

  releaseYear?: number | null;

  thumbnail?: string | null;

  videoUrl?: string | null;
  standardVideoUrl?: string | null;
  hdVideoUrl?: string | null;
  accessType?: "FREE" | "PREMIUM";

  duration: number;

  // Channel information
  channelId?: number | null;

  channelName?: string;

  channelLogo?: string | null;

  // Playlist information
  playlistId?: number;

  playlistName?: string;

  // Schedule information
  scheduleId?: number;

  scheduleStart?: string | null;

  scheduleEnd?: string | null;
}
