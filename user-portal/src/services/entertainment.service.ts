import api from "@/lib/api";

import type { Entertainment } from "@/types/entertainment";

export async function getEntertainments(): Promise<Entertainment[]> {
  try {
    const response = await api.get("/api/user-portal/entertainments");

    return response.data.entertainments ?? [];
  } catch (error) {
    console.error("Failed to fetch entertainments:", error);

    return [];
  }
}

export async function getEntertainmentById(id: string): Promise<Entertainment> {
  try {
    const response = await api.get(`/api/user-portal/entertainments/${id}`);

    return response.data.entertainment;
  } catch (error) {
    console.error("Failed to fetch entertainment:", error);

    throw error;
  }
}
