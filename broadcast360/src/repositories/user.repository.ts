import { prisma } from "@/lib/prisma";

export interface FindAllOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export class UserRepository {
  async findAll(options: FindAllOptions = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    // Build dynamic Prisma filter condition
    const where: any = {};

    if (options.search) {
      where.email = {
        contains: options.search,
        mode: "insensitive", // Case-insensitive email search
      };
    }

    if (options.role && options.role !== "ALL") {
      where.role = options.role;
    }

    if (options.status && options.status !== "ALL") {
      where.status = options.status;
    }

    // Run query & count in parallel for best performance
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
    };
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
    },
  ) {
    return prisma.user.update({
      where: {
        id,
      },

      data,
    });
  }
}
