import { prisma } from "@/lib/prisma";
import { PlaylistItemCreateInput } from "@/types/playlist-item";

export const PlaylistItemRepository = {

  findByOrder: (
    playlistId: number,
    order: number
  ) => {

    return prisma.playlistItem.findFirst({

      where: {

        playlistId,

        order

      }

    });

  },

  // Get the last item in a playlist
  getLastByPlaylistId: (playlistId: number) => { return prisma.playlistItem.findFirst({ where: { playlistId, }, orderBy: { order: "desc", }, select: { order: true, }, }); },

  createMovie: (playlistId: number, data: PlaylistItemCreateInput) => {
    return prisma.playlistItem.create({
      data: {
        playlistId,
        type: "MOVIE",
        movieId: data.contentId,
        order: data.order,
      },
    });
  },

  createEpisode: (playlistId: number, data: PlaylistItemCreateInput) => {
    return prisma.playlistItem.create({
      data: {
        playlistId,
        type: "EPISODE",
        episodeId: data.contentId,
        order: data.order,
      },
    });
  },

  createAd: (playlistId: number, data: PlaylistItemCreateInput) => {
    return prisma.playlistItem.create({
      data: {
        playlistId,
        type: "ADVERTISEMENT",
        advertisementId: data.contentId,
        order: data.order,
      },
    });
  },

  createNews: (playlistId: number, data: PlaylistItemCreateInput) => {
    return prisma.playlistItem.create({
      data: {
        playlistId,
        type: "NEWS",
        newsId: data.contentId,
        order: data.order,
      },
    });
  },

  createStream: (playlistId: number, data: PlaylistItemCreateInput) => {
    return prisma.playlistItem.create({
      data: {
        playlistId,
        type: "STREAM",
        streamId: data.contentId,
        order: data.order,
      },
    });
  },

  createEntertainment: (
    playlistId: number,
    data: PlaylistItemCreateInput
  ) => {
    return prisma.playlistItem.create({
      data: {
        playlistId,
        type: "ENTERTAINMENT",
        entertainmentId: data.contentId,
        order: data.order,
      },
    });
  },

  getByPlaylistId: (playlistId: number) => {
    return prisma.playlistItem.findMany({
      where: { playlistId },
      orderBy: { order: "asc" },
      include: {
        movie: true,
        episode: true,
        advertisement: true,
        news: true,
        stream: true,
        entertainment: true,
      },
    });
  },

  deleteItem: (id: number) => {
    return prisma.playlistItem.delete({
      where: {
        id,
      },
    });
  },
};