export type ProgramType = 'MOVIE' | 'SERIES_EPISODE' | 'NEWS' | 'ADVERTISEMENT';


export interface ProgramPlaylist {
  id: number;
  name: string;
  createdAt: Date;
}


export interface ProgramDetailsType {
  id: number;
  channel: string;
  title: string;
  type: ProgramType;
  description: string | null;
  createdAt: Date;
  playlists: ProgramPlaylist[];
}

export interface CreateProgramInput {
  channelId: number;
  title: string;
  type: ProgramType;
  description?: string;
}


export interface UpdateProgramInput {
  channelId: number;
  title: string;
  type: ProgramType;
  description?: string;
}


export interface ProgramFormData {
  id: number;
  channelId: number;
  title: string;
  type: ProgramType;
  description: string | null;
}