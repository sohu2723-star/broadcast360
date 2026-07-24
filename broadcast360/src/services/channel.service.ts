import {
  getPaginatedChannels,
  getAllChannels,
  getChannelById,
  createChannel,
  updateChannel,
  deleteChannel,
} from "@/repositories/channel.repository";

type CreateChannelInput = {
  name: string;
  description?: string;
  logo?: string;
  country?: string;
};

type UpdateChannelInput = {
  name?: string;
  description?: string;
  logo?: string;
  country?: string;
};

export async function fetchChannels() {
  const channels = await getAllChannels();
  return channels;
}

export function fetchChannelById(id: number) {
  return getChannelById(id);
}
export function addChannel(data: CreateChannelInput) {
  return createChannel(data);
}

export function editChannel(id: number, data: UpdateChannelInput) {
  return updateChannel(id, data);
}

export function removeChannel(id: number) {
  return deleteChannel(id);
}

export async function fetchPaginatedChannels(
  page: number,
  limit: number,
  search?: string,
) {
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
