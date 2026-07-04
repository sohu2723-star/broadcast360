import {
  getAllAdvertisements,
  deleteAdvertisement,
} from "@/repositories/advertisement.repository";

export async function fetchAdvertisements(
  page: number,
  limit: number,
  search?: string,
  status?: string
) {
  return getAllAdvertisements(page, limit, search, status);
}

export async function removeAdvertisement(id: number) {
  return deleteAdvertisement(id);
}