export interface Channel {
  id: number;
  name: string;
  description?: string;
  logo?: string | null;
  country?: string;
  streamKey?: string;
  accessType: "FREE" | "PREMIUM";

  playbackUrl: string | null;
  createdAt?: string;
  updatedAt?: string;

  streams?: {
    id: number;
    url: string;
  }[];
}

