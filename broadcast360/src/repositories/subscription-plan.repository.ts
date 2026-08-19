import { prisma } from "@/lib/prisma";

export async function findSubscriptionPlans(
  page: number,
  limit: number,
  search?: string,
) {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        name: {
          contains: search,
          mode: "insensitive" as const,
        },
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.subscriptionPlan.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            subscriptions: true,
            options: true,
          },
        },
      },
    }),

    prisma.subscriptionPlan.count({
      where,
    }),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function findSubscriptionPlanById(
  id: number,
) {
  return prisma.subscriptionPlan.findUnique({
    where: {
      id,
    },
    include: {
      options: {
        orderBy: {
          durationDays: "asc",
        },
      },
      _count: {
        select: {
          subscriptions: true,
        },
      },
    },
  });
}

export async function findSubscriptionPlanByName(
  name: string,
) {
  return prisma.subscriptionPlan.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });
}

export async function createSubscriptionPlan(
  data: {
    name: string;
    description?: string;
    isActive: boolean;
  },
) {
  return prisma.subscriptionPlan.create({
    data: {
      name: data.name,
      description: data.description || null,
      isActive: data.isActive,
    },
  });
}

export async function updateSubscriptionPlan(
  id: number,
  data: {
    name?: string;
    description?: string;
    isActive?: boolean;
  },
) {
  return prisma.subscriptionPlan.update({
    where: {
      id,
    },
    data: {
      ...data,
      description:
        data.description !== undefined
          ? data.description || null
          : undefined,
    },
  });
}

export async function deleteSubscriptionPlan(
  id: number,
) {
  return prisma.subscriptionPlan.delete({
    where: {
      id,
    },
  });
}