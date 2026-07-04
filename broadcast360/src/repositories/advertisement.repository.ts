import { prisma } from "@/lib/prisma";

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