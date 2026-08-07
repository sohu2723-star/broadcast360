import api from "@/lib/api";

export interface Channel {
  id: number;
  name: string;
  logo: string | null;
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  image: string | null;
  videoUrl: string | null;
  duration: number | null;
  type: string;
  createdAt: string;
  channel: Channel | null;
}

export async function getNews(params?: { channelId?: string; type?: string; limit?: number }): Promise<NewsItem[]> {
  const response = await api.get("/api/user-portal/news", { params });
  return response.data.news ?? [];
}

export async function getChannels(): Promise<Channel[]> {
  try {
    const response = await api.get("/api/channels");
    return response.data.data || response.data || [];
  } catch {
    return [];
  }
}