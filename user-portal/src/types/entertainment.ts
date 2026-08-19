export interface Entertainment {

  id: number;

  title: string;

  description?: string | null;

  category?: string | null;

  thumbnail?: string | null;

  videoUrl?: string | null;

  duration: number;

  releaseYear?: number | null;

  createdAt?: string | Date;


  // Playlist information
  playlistId?: number;

  playlistName?: string;


  // Channel information
  channelId?: number;

  channelName?: string;
  channelLogo?: string;


  // Schedule information
  scheduleId?: number;

  scheduleStart?: string;

  scheduleEnd?: string | null;


  // Old entertainment detail key
  entertainmentKey?: string;

}