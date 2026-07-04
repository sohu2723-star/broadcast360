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


export async function getAllAdvertisements(
  page: number,
  limit: number,
  search?: string,
  status?: string
) {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (status === "active") {
    where.active = true;
  } else if (status === "inactive") {
    where.active = false;
  }

  const [advertisements, total] = await Promise.all([
    prisma.advertisement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),

    prisma.advertisement.count({ where }),
  ]);

  return {
    advertisements,
    total,
  };
}

export function deleteAdvertisement(id: number) {
  return prisma.advertisement.delete({
    where: { id },
  });
}
