
import { API_ORIGIN, apiUrl } from "@/lib/api-url";
import type { Channel } from "@/types";

export interface ChannelAccessResponse extends Channel {
  allowed: boolean;
  accessType: "FREE" | "PREMIUM";
  playbackUrl: string;
}

class ChannelAccessError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any) {
    super(data?.message || "Channel access denied");
    this.name = "ChannelAccessError";
    this.status = status;
    this.data = data;
  }
}

/**
 * =====================================================
 * LOGO URL HELPER
 * =====================================================
 *
 * Backend may return:
 *
 *   /logos/news.jpg
 *
 * We convert it to:
 *
 *   http://localhost:BACKEND_PORT/logos/news.jpg
 *
 * If the backend already returns a complete URL,
 * we keep it unchanged.
 */
function getLogoUrl(
  logo?: string | null,
): string | null {
  if (!logo) {
    return null;
  }

  // Already an absolute URL
  if (
    logo.startsWith("http://") ||
    logo.startsWith("https://")
  ) {
    return logo;
  }

  // Backend-relative URL
  return `${API_ORIGIN}/${logo.replace(/^\//, "")}`;
}

export const channelService = {
  /**
   * =====================================================
   * GET ALL CHANNELS
   * =====================================================
   */
  async getAllChannels(): Promise<Channel[]> {
    const res = await fetch(
      apiUrl("/api/user-portal/channels"),
      {
        method: "GET",
        credentials: "include",
        cache: "default",
      },
    );

    if (!res.ok) {
      const message = await res.text();

      console.error(
        "CHANNEL API ERROR:",
        res.status,
        message,
      );

      throw new Error(
        "Failed to fetch channels",
      );
    }

    const data = await res.json();

    return data.map(
      (channel: Channel) => ({
        ...channel,

        /*
         * Convert backend logo path
         * into a backend URL.
         */
        logo: getLogoUrl(channel.logo),

        /*
         * Keep playbackUrl from the API.
         * Do not require hlsUrl anymore.
         */
        playbackUrl:
          channel.playbackUrl ??
          `${process.env.NEXT_PUBLIC_MEDIAMTX_HLS_URL}/${channel.streamKey}/index.m3u8`,
      }),
    );
  },

  /**
   * =====================================================
   * GET CHANNEL BY ID
   * =====================================================
   */
  async getChannelById(
    id: string,
  ): Promise<Channel> {
    const res = await fetch(
      apiUrl(`/api/user-portal/channels/${id}`),
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new ChannelAccessError(
        res.status,
        data,
      );
    }

    return {
      ...data,

      /*
       * Convert backend logo path
       * into a backend URL.
       */
      logo: getLogoUrl(data.logo),

      playbackUrl:
        data.playbackUrl ??
        `${process.env.NEXT_PUBLIC_MEDIAMTX_HLS_URL}/${data.streamKey}/index.m3u8`,
    };
  },

  /**
   * =====================================================
   * CHECK CHANNEL ACCESS
   * =====================================================
   */
  async getChannelAccess(
    id: string | number,
  ): Promise<ChannelAccessResponse> {
    const res = await fetch(
      apiUrl(`/api/user-portal/channels/${id}`),
      {
        method: "GET",

        /*
         * VERY IMPORTANT
         * Send user_token cookie.
         */
        credentials: "include",

        cache: "no-store",
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new ChannelAccessError(
        res.status,
        data,
      );
    }

    return {
      ...data,

      /*
       * Convert backend logo path
       * into a backend URL.
       */
      logo: getLogoUrl(data.logo),

      allowed: true,

      playbackUrl:
        data.playbackUrl ??
        `${process.env.NEXT_PUBLIC_MEDIAMTX_HLS_URL}/${data.streamKey}/index.m3u8`,
    };
  },
};

export { ChannelAccessError };
