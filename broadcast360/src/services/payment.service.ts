import {
  createPayment as createPaymentRepo,
  findPendingPaymentBySubscriptionId,
  findSubscriptionForPayment,
} from "@/repositories/payment.repository";

export async function createSubscriptionPayment(
  userId: number,
  data: {
    subscriptionId: number;
    method: "KPAY";
    transactionId: string;
    screenshotUrl: string;
  },
) {
  const subscription =
    await findSubscriptionForPayment(
      data.subscriptionId,
    );

  if (!subscription) {
    throw new Error("SUBSCRIPTION_NOT_FOUND");
  }

  // Make sure this subscription belongs to the logged-in user.
  if (subscription.userId !== userId) {
    throw new Error("SUBSCRIPTION_ACCESS_DENIED");
  }

  if (subscription.status !== "PENDING") {
    throw new Error("SUBSCRIPTION_NOT_PENDING");
  }

  const existingPayment =
    await findPendingPaymentBySubscriptionId(
      data.subscriptionId,
    );

  if (existingPayment) {
    throw new Error("PENDING_PAYMENT_EXISTS");
  }

  /*
   * IMPORTANT:
   * Amount comes from the database.
   */
  const amount = Number(subscription.option.price);

  return createPaymentRepo({
    subscriptionId: subscription.id,
    amount,
    currency: "MMK",
    method: data.method,
    transactionId: data.transactionId,
    screenshotUrl: data.screenshotUrl,
  });
}