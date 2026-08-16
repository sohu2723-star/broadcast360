import {
  countSubscriptionOptions,
  createSubscriptionOption as createSubscriptionOptionRepo,
  deleteSubscriptionOption as deleteSubscriptionOptionRepo,
  findSubscriptionOptionById,
  findSubscriptionOptions,
  updateSubscriptionOption as updateSubscriptionOptionRepo,
} from "@/repositories/subscription-option.repository";

export async function createSubscriptionOption(data: {
  planId: number;
  durationDays: number;
  price: number;
  discountPercent: number;
  isActive?: boolean;
}) {
  return createSubscriptionOptionRepo(data);
}

export async function getSubscriptionOptionById(
  id: number,
) {
  return findSubscriptionOptionById(id);
}

export async function fetchPaginatedSubscriptionOptions(
  page: number,
  limit: number,
  planId?: number,
) {
  const skip = (page - 1) * limit;

  const where: {
    planId?: number;
  } = {};

  if (planId) {
    where.planId = planId;
  }

  const [data, total] = await Promise.all([
    findSubscriptionOptions(
      skip,
      limit,
      where,
    ),
    countSubscriptionOptions(where),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(
        total / limit,
      ),
    },
  };
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
  /*
   * If durationDays is being changed, check
   * whether that duration already exists for
   * the same plan.
   */
  if (data.durationDays !== undefined) {
    const existing =
      await findSubscriptionOptionById(id);

    if (!existing) {
      throw new Error(
        "SUBSCRIPTION_OPTION_NOT_FOUND",
      );
    }

    if (
      existing.durationDays !==
      data.durationDays
    ) {
      const duplicate =
        await findSubscriptionOptions(
          0,
          1,
          {
            planId: existing.planId,
            durationDays:
              data.durationDays,
          },
        );

      if (duplicate.length > 0) {
        throw new Error(
          "SUBSCRIPTION_OPTION_ALREADY_EXISTS",
        );
      }
    }
  }

  return updateSubscriptionOptionRepo(
    id,
    data,
  );
}

export async function deleteSubscriptionOption(
  id: number,
) {
  return deleteSubscriptionOptionRepo(id);
}