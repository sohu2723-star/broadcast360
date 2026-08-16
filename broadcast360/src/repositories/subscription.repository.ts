import { prisma } from "@/lib/prisma";

export async function createSubscription(data: {
  userId: number;
  planId: number;
  optionId: number;
}) {
  return prisma.subscription.create({
    data: {
      userId: data.userId,
      planId: data.planId,
      optionId: data.optionId,
      status: "PENDING",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      plan: true,
      option: true,
      payments: true,
    },
  });
}

export async function findSubscriptionById(id: number) {
  return prisma.subscription.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      plan: true,
      option: true,
      payments: true,
    },
  });
}

export async function findSubscriptions(
  skip: number,
  take: number,
  where: any,
) {
  return prisma.subscription.findMany({
    where,
    skip,
    take,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      plan: true,
      option: true,
      payments: true,
    },
  });
}

export async function countSubscriptions(where: any) {
  return prisma.subscription.count({
    where,
  });
}

export async function updateSubscription(
  id: number,
  data: {
    status?: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
    startDate?: Date | null;
    endDate?: Date | null;
  },
) {
  return prisma.subscription.update({
    where: { id },
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      plan: true,
      option: true,
      payments: true,
    },
  });
}

export async function deleteSubscription(id: number) {
  return prisma.subscription.delete({
    where: { id },
  });
}

export async function approveSubscriptionPayment(
  subscriptionId: number,
) {
  return prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        option: true,
        payments: true,
      },
    });

    if (!subscription) {
      throw new Error("SUBSCRIPTION_NOT_FOUND");
    }

    if (subscription.status !== "PENDING") {
      throw new Error("SUBSCRIPTION_NOT_PENDING");
    }

    const payment = subscription.payments.find(
      (item) => item.status === "PENDING",
    );

    if (!payment) {
      throw new Error("PENDING_PAYMENT_NOT_FOUND");
    }

    const startDate = new Date();

    const endDate = new Date(startDate);
    endDate.setDate(
      endDate.getDate() + subscription.option.durationDays,
    );

    const updatedPayment = await tx.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "PAID",
        paidAt: startDate,
      },
    });

    const updatedSubscription =
      await tx.subscription.update({
        where: {
          id: subscriptionId,
        },
        data: {
          status: "ACTIVE",
          startDate,
          endDate,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          plan: true,
          option: true,
          payments: true,
        },
      });

    return {
      subscription: updatedSubscription,
      payment: updatedPayment,
    };
  });
}

export async function rejectSubscriptionPayment(
  subscriptionId: number,
) {
  return prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        payments: true,
      },
    });

    if (!subscription) {
      throw new Error("SUBSCRIPTION_NOT_FOUND");
    }

    if (subscription.status !== "PENDING") {
      throw new Error("SUBSCRIPTION_NOT_PENDING");
    }

    const payment = subscription.payments.find(
      (item) => item.status === "PENDING",
    );

    if (!payment) {
      throw new Error("PENDING_PAYMENT_NOT_FOUND");
    }

    await tx.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "FAILED",
      },
    });

    return tx.subscription.update({
      where: {
        id: subscriptionId,
      },
      data: {
        status: "CANCELLED",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        plan: true,
        option: true,
        payments: true,
      },
    });
  });
}

export async function findActiveSubscriptionByUserId(userId: number) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      endDate: {
        gt: new Date(),
      },
    },
    orderBy: {
      endDate: "desc",
    },
    include: {
      plan: true,
      option: true,
      payments: true,
    },
  });
}

export async function findPendingSubscriptionByUserId(
  userId: number,
) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: "PENDING",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      plan: true,
      option: true,
      payments: true,
    },
  });
}

export async function findSubscriptionOptionForPurchase(
  optionId: number,
) {
  return prisma.subscriptionOption.findFirst({
    where: {
      id: optionId,
      isActive: true,
      plan: {
        isActive: true,
      },
    },
    include: {
      plan: true,
    },
  });
}

export async function createPendingSubscription(
  userId: number,
  optionId: number,
) {
  return prisma.$transaction(async (tx) => {
    const option = await tx.subscriptionOption.findFirst({
      where: {
        id: optionId,
        isActive: true,
        plan: {
          isActive: true,
        },
      },
      include: {
        plan: true,
      },
    });

    if (!option) {
      throw new Error("SUBSCRIPTION_OPTION_NOT_FOUND");
    }

    const subscription = await tx.subscription.create({
      data: {
        userId,
        planId: option.planId,
        optionId: option.id,
        status: "PENDING",
      },
      include: {
        plan: true,
        option: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return subscription;
  });
}