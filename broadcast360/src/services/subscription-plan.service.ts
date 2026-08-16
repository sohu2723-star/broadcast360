import {
  createSubscriptionPlan as createPlan,
  deleteSubscriptionPlan as deletePlan,
  findSubscriptionPlanById,
  findSubscriptionPlanByName,
  findSubscriptionPlans,
  updateSubscriptionPlan as updatePlan,
} from "@/repositories/subscription-plan.repository";

export async function getSubscriptionPlans(
  page: number,
  limit: number,
  search?: string,
) {
  return findSubscriptionPlans(
    page,
    limit,
    search,
  );
}

export async function getSubscriptionPlanById(
  id: number,
) {
  const plan =
    await findSubscriptionPlanById(id);

  if (!plan) {
    throw new Error(
      "SUBSCRIPTION_PLAN_NOT_FOUND",
    );
  }

  return plan;
}

export async function createSubscriptionPlan(
  data: {
    name: string;
    description?: string;
    isActive: boolean;
  },
) {
  const existing =
    await findSubscriptionPlanByName(
      data.name,
    );

  if (existing) {
    throw new Error(
      "SUBSCRIPTION_PLAN_NAME_EXISTS",
    );
  }

  return createPlan(data);
}

export async function updateSubscriptionPlan(
  id: number,
  data: {
    name?: string;
    description?: string;
    isActive?: boolean;
  },
) {
  const existing =
    await findSubscriptionPlanById(id);

  if (!existing) {
    throw new Error(
      "SUBSCRIPTION_PLAN_NOT_FOUND",
    );
  }

  if (data.name) {
    const duplicate =
      await findSubscriptionPlanByName(
        data.name,
      );

    if (
      duplicate &&
      duplicate.id !== id
    ) {
      throw new Error(
        "SUBSCRIPTION_PLAN_NAME_EXISTS",
      );
    }
  }

  return updatePlan(id, data);
}

export async function deleteSubscriptionPlan(
  id: number,
) {
  const existing =
    await findSubscriptionPlanById(id);

  if (!existing) {
    throw new Error(
      "SUBSCRIPTION_PLAN_NOT_FOUND",
    );
  }

  /*
   * Don't delete a plan that already has
   * subscriptions or options.
   */
  if (
    existing._count.subscriptions > 0 ||
    existing.options.length > 0
  ) {
    throw new Error(
      "SUBSCRIPTION_PLAN_IN_USE",
    );
  }

  return deletePlan(id);
}