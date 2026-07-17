import { StreamProtocol, StreamStatus } from "@/generated/prisma/client";

export interface CreateStreamInput {
  channelId: number;

  name: string;

  url: string;

  protocol: StreamProtocol;

  description?: string | null;
}

export interface UpdateStreamInput {
  channelId?: number;

  name?: string;

  url?: string;

  protocol?: StreamProtocol;

  status?: StreamStatus;

  description?: string | null;
}

export interface Stream {
  id: number;
  channelId: number;
  name: string;
  url: string;
  protocol: "RTSP" | "RTMP" | "HLS" | "WEBRTC" | "SRT";
  status: "ONLINE" | "OFFLINE" | "ERROR";
  description?: string | null;
  createdAt: string;

  channel: {
    id: number;
    name: string;
  };
}
