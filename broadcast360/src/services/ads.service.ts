import {
  getAdvertisementById,
} from "@/repositories/ads.repository";

export async function fetchAdvertisementById(id: number) {
  return getAdvertisementById(id);
}
