import {
  getEpisodeById,
  deleteEpisode,
} from "@/repositories/episode.repository";

export async function fetchEpisodeById(id: number) {
  return getEpisodeById(id);
}

export async function removeEpisode(id: number) {
  return deleteEpisode(id);
}