import {
  countSubscriptions,
  createSubscription as createSubscriptionRepo,
  deleteSubscription as deleteSubscriptionRepo,
  findSubscriptionById,
  findSubscriptions,
  updateSubscription as updateSubscriptionRepo,
  approveSubscriptionPayment as approveSubscriptionPaymentRepo,
  rejectSubscriptionPayment as rejectSubscriptionPaymentRepo,
  createPendingSubscription,
  findActiveSubscriptionByUserId,
  findPendingSubscriptionByUserId,
  findSubscriptionOptionForPurchase,
} from "@/repositories/subscription.repository";

export async function createSubscription(data: {
  userId: number;
  planId: number;
  optionId: number;
}) {
  return createSubscriptionRepo(data);
}

export async function getSubscriptionById(id: number) {
  return findSubscriptionById(id);
}

export async function fetchPaginatedSubscriptions(
  page: number,
  limit: number,
  search?: string,
  status?: string,
) {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.user = {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    };
  }

  const [data, total] = await Promise.all([
    findSubscriptions(skip, limit, where),
    countSubscriptions(where),
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

export async function updateSubscription(
  id: number,
  data: {
    status?: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
    startDate?: Date | null;
    endDate?: Date | null;
  },
) {
  return updateSubscriptionRepo(id, data);
}

export async function deleteSubscription(id: number) {
  return deleteSubscriptionRepo(id);
}

export async function approveSubscriptionPayment(
  subscriptionId: number,
) {
  return approveSubscriptionPaymentRepo(subscriptionId);
}

export async function rejectSubscriptionPayment(
  subscriptionId: number,
) {
  return rejectSubscriptionPaymentRepo(subscriptionId);
}


export async function createUserSubscription(
  userId: number,
  optionId: number,
) {
  const activeSubscription =
    await findActiveSubscriptionByUserId(userId);

  if (activeSubscription) {
    throw new Error("ACTIVE_SUBSCRIPTION_EXISTS");
  }

  const pendingSubscription =
    await findPendingSubscriptionByUserId(userId);

  if (pendingSubscription) {
    throw new Error("PENDING_SUBSCRIPTION_EXISTS");
  }

  const option =
    await findSubscriptionOptionForPurchase(optionId);

  if (!option) {
    throw new Error("SUBSCRIPTION_OPTION_NOT_FOUND");
  }

  return createPendingSubscription(userId, optionId);
}

export async function isUserPremium(userId: number) {
  const subscription = await findActiveSubscriptionByUserId(userId);

  return !!subscription;
}