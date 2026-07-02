

import {
  getAdvertisementById,
} from "@/repositories/advertisement.repository";

export async function fetchAdvertisementById(id: number) {
  return getAdvertisementById(id);
}

