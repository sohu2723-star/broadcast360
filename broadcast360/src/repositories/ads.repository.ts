import { prisma } from "@/lib/prisma";

export function getAdvertisements() {
  return prisma.advertisement.findMany({
    orderBy: {
      id: "desc", 
    },
  });
}

export function getAdvertisementById(id: number) {
  return prisma.advertisement.findUnique({
    where: { id },
  });
}
