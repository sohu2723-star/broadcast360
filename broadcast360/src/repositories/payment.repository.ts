import { prisma } from "@/lib/prisma";

export async function findSubscriptionForPayment(
  subscriptionId: number,
) {
  return prisma.subscription.findUnique({
    where: {
      id: subscriptionId,
    },
    include: {
      plan: true,
      option: true,
      payments: true,
    },
  });
}

export async function findPendingPaymentBySubscriptionId(
  subscriptionId: number,
) {
  return prisma.payment.findFirst({
    where: {
      subscriptionId,
      status: "PENDING",
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createPayment(data: {
  subscriptionId: number;
  amount: number;
  currency: string;
  method: "KPAY";
  transactionId: string;
  screenshotUrl: string;
}) {
  return prisma.payment.create({
    data: {
      subscriptionId: data.subscriptionId,
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      transactionId: data.transactionId,
      screenshotUrl: data.screenshotUrl,
      status: "PENDING",
    },
    include: {
      subscription: {
        include: {
          plan: true,
          option: true,
        },
      },
    },
  });
}