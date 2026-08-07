export interface Channel {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  country?: string;
  streamKey?: string;

  playbackUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

