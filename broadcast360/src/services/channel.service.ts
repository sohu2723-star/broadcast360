import { getPaginatedChannels, getChannelById, deleteChannel } from "@/repositories/channel.repository";

export async function fetchPaginatedChannels(page: number, limit: number, search?: string) {
  const validatedPage = Math.max(1, page);
  const validatedLimit = Math.max(1, limit);

  const { data, total } = await getPaginatedChannels({
    page: validatedPage,
    limit: validatedLimit,
    search,
  });

  return {
    data,
    pagination: {
      page: validatedPage,
      limit: validatedLimit,
      total,
    },
  };
}

export function fetchChannelById(id: number) {
  return getChannelById(id);
}

export function removeChannel(id: number) {
  return deleteChannel(id);
}