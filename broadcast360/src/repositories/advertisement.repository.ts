import { prisma } from "@/lib/prisma";

export function getAdvertisements() {
  return prisma.advertisement.findMany();
}

export function getAdvertisementById(id: number) {
  return prisma.advertisement.findUnique({
    where: { id },
  });
}

export function createAdvertisement(data: {
  title: string;
  videoUrl: string;
  duration: number;
  active: boolean;
}) {
  return prisma.advertisement.create({
    data,
  });
}

export function updateAdvertisement(
  id: number,
  data: {
    title: string;
    active: boolean;
    videoUrl?: string;
    duration?: number;
  }
) {
  return prisma.advertisement.update({
    where: { id },
    data,
  });
}


