import { ADMIN_API_URL, defaultHeaders } from "@/services/apiConfig"; 
import { Channel } from "@/types"; 

export const channelService = {
  async getAllChannels(): Promise<Channel[]> {
    try {
      const res = await fetch(`${ADMIN_API_URL}/api/user-portal/channel`, {
        method: "GET",
        headers: defaultHeaders,
        next: { revalidate: 60 } 
      });

      if (!res.ok) throw new Error("Failed to fetch channels from admin");
      return await res.json();
    } catch (error) {
      console.error("Error in getAllChannels service:", error);
      throw error;
    }
  },

  async getChannelById(id: string): Promise<Channel> {
    try {
      const res = await fetch(`${ADMIN_API_URL}/api/user-portal/channel/${id}`, {
        method: "GET",
        headers: defaultHeaders,
      });

      if (!res.ok) throw new Error(`Failed to fetch channel ID: ${id}`);
      return await res.json();
    } catch (error) {
      console.error(`Error in getChannelById (${id}):`, error);
      throw error;
    }
  }
};