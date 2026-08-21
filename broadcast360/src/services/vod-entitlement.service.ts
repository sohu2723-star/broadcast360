import { prisma } from "@/lib/prisma";

export type VodEntitlement = {
  userId: number | null;
  isPremium: boolean;
  isTrial: boolean;
  canViewPremium: boolean;
  creditBalance: number;
  trialEndsAt: Date | null;
  subscriptionEndsAt: Date | null;
};

function asDate(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function redeemCreditForContent(userId: number, contentKey: string) {
  const eventKey = `redeem:${userId}:${contentKey}`;
  const existing = await prisma.creditLedger.findFirst({
    where: { userId, eventKey },
    select: { id: true },
  });
  if (existing) return true;

  const entitlement = await getVodEntitlement(userId);
  if (entitlement.creditBalance < 1) return false;

  try {
    await prisma.creditLedger.create({
      data: {
        userId,
        amount: -1,
        eventType: "REDEMPTION",
        eventKey,
      },
    });
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("duplicate") || message.includes("unique") || message.includes("23505")) return true;
    throw error;
  }
}

export async function getVodEntitlement(userId: number | null): Promise<VodEntitlement> {
  if (!userId) {
    return {
      userId: null,
      isPremium: false,
      isTrial: false,
      canViewPremium: false,
      creditBalance: 0,
      trialEndsAt: null,
      subscriptionEndsAt: null,
    };
  }

  const now = new Date();
  const [user, subscription, ledger] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true, trialStartedAt: true, trialEndsAt: true },
    }),
    prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      orderBy: { endDate: "desc" },
      select: { endDate: true },
    }),
    prisma.creditLedger.findMany({
      where: { userId },
      select: { amount: true },
    }),
  ]);

  if (!user || user.status !== "ACTIVE") {
    return {
      userId,
      isPremium: false,
      isTrial: false,
      canViewPremium: false,
      creditBalance: 0,
      trialEndsAt: null,
      subscriptionEndsAt: null,
    };
  }

  const trialEndsAt = asDate(user.trialEndsAt);
  const subscriptionEndsAt = asDate(subscription?.endDate);
  const isTrial = Boolean(trialEndsAt && trialEndsAt > now);
  const isPremium = Boolean(subscription) || isTrial;
  const creditBalance = (ledger ?? []).reduce(
    (balance: number, entry: { amount?: unknown }) => balance + Number(entry.amount ?? 0),
    0,
  );

  return {
    userId,
    isPremium,
    isTrial,
    canViewPremium: isPremium || creditBalance > 0,
    creditBalance: Math.max(0, creditBalance),
    trialEndsAt,
    subscriptionEndsAt,
  };
}
