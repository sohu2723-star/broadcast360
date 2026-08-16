import { prisma } from "@/lib/prisma";

export async function createSubscriptionOption(
  data: {
    planId: number;
    durationDays: number;
    price: number;
    discountPercent: number;
    isActive?: boolean;
  },
) {
  return prisma.subscriptionOption.create({
    data: {
      planId: data.planId,
      durationDays: data.durationDays,
      price: data.price,
      discountPercent:
        data.discountPercent,
      isActive: data.isActive ?? true,
    },
    include: {
      plan: true,
    },
  });
}

export async function findSubscriptionOptionById(
  id: number,
) {
  return prisma.subscriptionOption.findUnique({
    where: {
      id,
    },
    include: {
      plan: true,
      subscriptions: true,
    },
  });
}

export async function findSubscriptionOptions(
  skip: number,
  take: number,
  where: {
    planId?: number;
    durationDays?: number;
  },
) {
  return prisma.subscriptionOption.findMany({
    where,
    skip,
    take,
    orderBy: {
      durationDays: "asc",
    },
    include: {
      plan: true,
    },
  });
}

export async function countSubscriptionOptions(
  where: {
    planId?: number;
    durationDays?: number;
  },
) {
  return prisma.subscriptionOption.count({
    where,
  });
}

export async function updateSubscriptionOption(
  id: number,
  data: {
    durationDays?: number;
    price?: number;
    discountPercent?: number;
    isActive?: boolean;
  },
) {
  return prisma.subscriptionOption.update({
    where: {
      id,
    },
    data,
    include: {
      plan: true,
    },
  });
}

export async function deleteSubscriptionOption(
  id: number,
) {
  return prisma.subscriptionOption.delete({
    where: {
      id,
    },
  });
}