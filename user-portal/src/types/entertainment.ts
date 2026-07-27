export interface Entertainment {
  id: number;

  title: string;

  description?: string | null;

  category?: string | null;

  thumbnail?: string | null;

  videoUrl?: string | null;

  duration: number;

  releaseYear?: number | null;

  createdAt: string | Date;

  channelId?: number;

  channelName?: string;

  scheduleId?: number;

  scheduleStart?: string;

  scheduleEnd?: string | null;

  entertainmentKey?: string;
}