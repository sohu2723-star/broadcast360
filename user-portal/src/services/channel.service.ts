import { ADMIN_API_URL } from "@/services/apiConfig";

import type { Channel } from "@/types";


export const channelService = {


  async getAllChannels(): Promise<Channel[]> {

    try {

      const res = await fetch(
        `${ADMIN_API_URL}/api/user-portal/channels`,
        {
          method: "GET",

          cache: "no-store",

        }
      );


      if (!res.ok) {

        const message =
          await res.text();


        console.error(
          "CHANNEL API ERROR:",
          res.status,
          message
        );


        throw new Error(
          "Failed to fetch channels"
        );

      }


      const data = await res.json();


      console.log(
        "CHANNEL API RESPONSE:",
        data
      );


      return data.map(
        (channel: Channel) => ({

          ...channel,

          hlsUrl:
            `${process.env.NEXT_PUBLIC_MEDIAMTX_HLS_URL}/${channel.streamKey}/index.m3u8`

        })
      );


    } catch (error) {


      console.error(
        "GET CHANNEL ERROR:",
        error
      );


      throw error;

    }

  },



  async getChannelById(
    id:string
  ):Promise<Channel>{


    const res = await fetch(

      `${ADMIN_API_URL}/api/user-portal/channels/${id}`,

      {
        method:"GET",

        cache:"no-store",

      }

    );


    if(!res.ok){

      throw new Error(
        `Failed to fetch channel ${id}`
      );

    }


    const channel =
      await res.json();


    return {

      ...channel,

      hlsUrl:
        `${process.env.NEXT_PUBLIC_MEDIAMTX_HLS_URL}/${channel.streamKey}/index.m3u8`

    };


  }


};