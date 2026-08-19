import { prisma } from "@/lib/prisma";
import { Prisma, Role, UserStatus } from "@/generated/prisma/client";

const userSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  phone: true,
  role: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export async function getUsers() {
  return prisma.user.findMany({
    select: userSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getPaginatedUsers({
  page = 1,
  limit = 10,
  search,
  role,
  status,
}: {
  page: number;
  limit: number;
  search?: string;
  role?: Role | "ALL";
  status?: UserStatus | "ALL";
}) {
  const skip = (page - 1) * limit;
  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role && role !== "ALL") where.role = role;
  if (status && status !== "ALL") where.status = status;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [data, total, totalUsers, totalAdmins, activeUsers, newThisMonth] =
    await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: userSelect,
      }),
      prisma.user.count({ where }),
      prisma.user.count({ where: { role: Role.USER } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.user.count({ where: { status: UserStatus.ACTIVE, role: Role.USER } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

  return {
    data,
    total,
    stats: { totalUsers, totalAdmins, activeUsers, newThisMonth },
  };
}

export async function getUserById(id: number) {
  return prisma.user.findUnique({ where: { id }, select: userSelect });
}

export async function deleteUser(id: number) {
  return prisma.user.delete({ where: { id } });
}

export class UserRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  update(id: number, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  }

  updateLastLogin(id: number) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  updateProfile(
    id: number,
    data: { name?: string; email?: string; phone?: string; avatar?: string },
  ) {
    return prisma.user.update({ where: { id }, data });
  }
}
