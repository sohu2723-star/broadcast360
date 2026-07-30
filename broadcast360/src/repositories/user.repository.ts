import { prisma } from "@/lib/prisma";

export class UserRepository {
  async findAll() {
    return prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: number) {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async create(data: {
    name: string;
    email: string;
    password: string;

    phone?: string | null;

    role?: "ADMIN" | "USER";

    status?: "ACTIVE" | "INACTIVE" | "BANNED";

    avatar?: string | null;
  }) {
    return prisma.user.create({
      data: {
        name: data.name,

        email: data.email,

        password: data.password,

        phone: data.phone ?? null,

        avatar: data.avatar ?? null,

        role: data.role ?? "USER",

        status: data.status ?? "ACTIVE",
      },
    });
  }

  async update(id: number, data: any) {
    return prisma.user.update({
      where: {
        id,
      },

      data,
    });
  }

  async delete(id: number) {
    return prisma.user.delete({
      where: {
        id,
      },
    });
  }

  async updateLastLogin(id: number) {
    return prisma.user.update({
      where: {
        id,
      },

      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  async updateProfile(
  id: number,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
  }
) {
  return prisma.user.update({
    where: {
      id,
    },

    data,
  });
}
}
