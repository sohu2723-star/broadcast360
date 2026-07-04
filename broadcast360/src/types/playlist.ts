export interface Playlist {
  id: number;
  name: string;
  programId: number;
  totalDuration?: number;
  createdAt: string;
}

export interface PlaylistCreateInput {
  name: string;
}