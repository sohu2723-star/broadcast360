export type StreamProtocol = 'RTSP' | 'RTMP' | 'HLS' | 'WEBRTC';
export type StreamStatus = 'ONLINE' | 'OFFLINE';


export interface CreateStreamInput {
  channelId: number;
  name: string;
  protocol: StreamProtocol;
  description?: string | null;
}

export interface UpdateStreamInput {
  channelId?: number;
  name?: string;
  protocol?: StreamProtocol;
  status?: StreamStatus;
  description?: string | null;
}

export interface Stream {
  id: number;
  channelId: number;
  name: string;
  url: string;
  protocol: StreamProtocol;
  status: StreamStatus;
  description?: string | null;
  createdAt: string;

  channel: {
    id: number;
    name: string;
  };
}