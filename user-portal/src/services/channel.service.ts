import { ADMIN_API_URL } from "@/services/apiConfig";
import type { Channel } from "@/types";

export const channelService = {
  async getAllChannels(): Promise<Channel[]> {
    try {
      const res = await fetch(`${ADMIN_API_URL}/api/user-portal/channels`, {
        method: "GET",
        next: {
          revalidate: 60,
        },
      });

      if (!res.ok) {
        const error = await res.text();

        console.error("CHANNEL API ERROR:", res.status, error);

        throw new Error("Failed to fetch channels");
      }

      return await res.json();
    } catch (error) {
      console.error("Error loading channels:", error);

      throw error;
    }
  },

  async getChannelById(id: string): Promise<Channel> {
    try {
      const res = await fetch(
        `${ADMIN_API_URL}/api/user-portal/channels/${id}`,
        {
          method: "GET",
        },
      );

      if (!res.ok) {
        const error = await res.text();

        console.error("CHANNEL DETAIL ERROR:", res.status, error);

        throw new Error(`Failed to fetch channel ${id}`);
      }

      return await res.json();
    } catch (error) {
      console.error(`Error loading channel ${id}:`, error);

      throw error;
    }
  },
};
