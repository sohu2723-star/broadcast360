import {
  getPaginatedChannels,
  getAllChannels,
  createChannel,
  updateChannel,
  deleteChannel,
} from "@/repositories/channel.repository";

import { prisma } from "@/lib/prisma";
import { PlaylistService } from "@/services/playlist.service";

type ChannelAccessType = "FREE" | "PREMIUM";

type CreateChannelInput = {
  name: string;
  description?: string;
  logo?: string;
  country?: string;
  accessType: ChannelAccessType;
};


type UpdateChannelInput = {
  name?: string;
  description?: string;
  logo?: string;
  country?: string;
  accessType: ChannelAccessType,
};


export async function fetchChannels() {
  return getAllChannels();
}

export async function fetchChannelById(id: number) {
  const channel = await prisma.channel.findUnique({
    where: {
      id,
    },
    include: {
      defaultPlaylist: true,

      programs: {
        include: {
          playlists: {
            select: {
              id: true,
              name: true,
              totalDuration: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });

  if (!channel) {
    return null;
  }

  // Get playlists from programs belonging to this channel
  const playlists = channel.programs.flatMap(
    (program) => program.playlists,
  );

  // Remove duplicates in case the same playlist appears more than once
  const uniquePlaylists = Array.from(
    new Map(
      playlists.map((playlist) => [playlist.id, playlist]),
    ).values(),
  );

  const playlistsWithDuration = await Promise.all(
    uniquePlaylists.map(async (playlist) => {
      const data = await PlaylistService.getPlaylistById(
        playlist.id,
      );

      return {
        id: playlist.id,
        name: playlist.name,
        totalDuration: data?.totalDuration ?? 0,
      };
    }),
  );

  return {
    ...channel,

    playlists: playlistsWithDuration,

    defaultPlaylist: channel.defaultPlaylist
      ? await PlaylistService.getPlaylistById(
          channel.defaultPlaylist.id,
        )
      : null,
  };
}

export async function updateDefaultPlaylist(
 id:number,
 defaultPlaylistId:number|null
){

 return prisma.channel.update({

  where:{
    id
  },

  data:{
    defaultPlaylistId
  },

  include:{
    defaultPlaylist:true
  }

 });


}



export function addChannel(
 data:CreateChannelInput
){
 return createChannel(data);
}



export function editChannel(
 id:number,
 data:UpdateChannelInput
){
 return updateChannel(id,data);
}



export function removeChannel(id:number){
 return deleteChannel(id);
}



export async function fetchPaginatedChannels(
 page:number,
 limit:number,
 search?:string
){

 const validatedPage=Math.max(1,page);
 const validatedLimit=Math.max(1,limit);


 const {data,total}=await getPaginatedChannels({

  page:validatedPage,
  limit:validatedLimit,
  search

 });


 return {

  data,

  pagination:{
    page:validatedPage,
    limit:validatedLimit,
    total
  }

 };

}