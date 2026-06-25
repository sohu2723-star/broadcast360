import { getAllChannels, getChannelById }
from "@/repositories/channel.repository";

export async function fetchChannels() {
  const channels = await getAllChannels();
  return channels;
}

export function fetchChannelById(id:number){
  return getChannelById(id);
}

