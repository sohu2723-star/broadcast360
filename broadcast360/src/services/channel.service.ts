import { getAllChannels, getChannelById,deleteChannel }
from "@/repositories/channel.repository";

export async function fetchChannels() {
  const channels = await getAllChannels();
  return channels;
}

export function fetchChannelById(id:number){
  return getChannelById(id);
}

export function removeChannel(id:number){
 return deleteChannel(id);
}