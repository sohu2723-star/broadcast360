import { prisma } from "@/lib/prisma";
import { ReactivationRequestStatus, UserStatus } from "@/generated/prisma/client";

const requestSelect = {
  id: true,
  userId: true,
  name: true,
  email: true,
  message: true,
  status: true,
  reviewedById: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      lastLoginAt: true,
    },
  },
  reviewedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

export async function createReactivationRequest(data: {
  email: string;
  name: string;
  message: string;
}) {
  const email = data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.role !== "USER") {
    throw new Error("No user account was found for this Gmail address");
  }
  if (user.status === UserStatus.ACTIVE) {
    throw new Error("This account is already active");
  }
  if (user.status === UserStatus.BANNED) {
    throw new Error("Banned accounts cannot request reactivation");
  }

  const pending = await prisma.accountReactivationRequest.findFirst({
    where: {
      userId: user.id,
      status: ReactivationRequestStatus.PENDING,
    },
    orderBy: { createdAt: "desc" },
  });

  if (pending) {
    return prisma.accountReactivationRequest.update({
      where: { id: pending.id },
      data: {
        name: data.name.trim(),
        email,
        message: data.message.trim(),
      },
      select: requestSelect,
    });
  }

  return prisma.accountReactivationRequest.create({
    data: {
      userId: user.id,
      name: data.name.trim(),
      email,
      message: data.message.trim(),
    },
    select: requestSelect,
  });
}

export async function getReactivationRequests({
  page,
  limit,
  status,
}: {
  page: number;
  limit: number;
  status?: ReactivationRequestStatus;
}) {
  const where = status ? { status } : {};
  const skip = (page - 1) * limit;
  const [data, total] = await prisma.$transaction([
    prisma.accountReactivationRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: requestSelect,
    }),
    prisma.accountReactivationRequest.count({ where }),
  ]);

  return { data, total };
}

export async function reviewReactivationRequest({
  id,
  status,
  adminId,
}: {
  id: number;
  status: "APPROVED" | "REJECTED";
  adminId: number;
}) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.accountReactivationRequest.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    });

    if (!request) throw new Error("Reactivation request not found");
    if (request.status !== ReactivationRequestStatus.PENDING) {
      throw new Error("This reactivation request has already been reviewed");
    }

    if (status === "APPROVED") {
      await tx.user.update({
        where: { id: request.userId },
        data: {
          status: UserStatus.ACTIVE,
          lastLoginAt: null,
        },
      });
    }

    return tx.accountReactivationRequest.update({
      where: { id },
      data: {
        status,
        reviewedById: adminId,
        reviewedAt: new Date(),
      },
      select: requestSelect,
    });
  });
}

export async function getPendingReactivationRequestCount() {
  return prisma.accountReactivationRequest.count({
    where: { status: ReactivationRequestStatus.PENDING },
  });
}
