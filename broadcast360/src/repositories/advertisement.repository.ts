import { prisma } from "@/lib/prisma";

export interface CreateAdInput {
  title: string;
  videoUrl: string;
  duration: number;
  //format: string;
  //resolution: string;
  //size: string;
  active: boolean;
}

export async function dbCreateAdvertisement(data: CreateAdInput) {
  return await prisma.advertisement.create({
    data,
  });
}