import {
  deleteUser as deleteUserRecord,
  getPaginatedUsers,
  getUserById,
  getUsers as listUsers,
  UserRepository,
} from "@/repositories/user.repository";
import { Role, UserStatus } from "@/generated/prisma/client";
import { hashPassword } from "@/lib/password";

const userRepository = new UserRepository();

type UserListFilters = {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role | "ALL" | string;
  status?: UserStatus | "ALL" | string;
};

type CreateUserData = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role?: Role;
  status?: UserStatus;
};

type UpdateUserData = Partial<Omit<CreateUserData, "password">> & {
  password?: string;
};

function safeUser<T extends { password?: unknown }>(user: T) {
  const { password: _password, ...result } = user;
  return result;
}

export async function fetchUsers() {
  return listUsers();
}

export async function fetchPaginatedUsers({
  page,
  limit,
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
  const validatedPage = Math.max(1, page);
  const validatedLimit = Math.min(100, Math.max(1, limit));
  const result = await getPaginatedUsers({
    page: validatedPage,
    limit: validatedLimit,
    search,
    role,
    status,
  });

  return {
    data: result.data,
    stats: result.stats,
    pagination: {
      page: validatedPage,
      limit: validatedLimit,
      total: result.total,
      totalPages: Math.ceil(result.total / validatedLimit) || 1,
    },
  };
}

export async function fetchUserById(id: number) {
  return getUserById(id);
}

export async function removeUser(id: number) {
  return deleteUserRecord(id);
}

export class UserService {
  async getUsers(filters: UserListFilters = {}) {
    const result = await getPaginatedUsers({
      page: Math.max(1, filters.page ?? 1),
      limit: Math.min(100, Math.max(1, filters.limit ?? 10)),
      search: filters.search,
      role:
        filters.role === "ADMIN" || filters.role === "USER"
          ? filters.role
          : "ALL",
      status:
        filters.status === "ACTIVE" ||
        filters.status === "INACTIVE" ||
        filters.status === "BANNED"
          ? filters.status
          : "ALL",
    });

    return { users: result.data, total: result.total };
  }

  async getUser(id: number) {
    return getUserById(id);
  }

  async createUser(data: CreateUserData) {
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: await hashPassword(data.password),
      phone: data.phone,
      avatar: data.avatar,
      role: data.role ?? Role.USER,
      status: data.status ?? UserStatus.ACTIVE,
    });

    return safeUser(user);
  }

  async updateUser(id: number, data: UpdateUserData) {
    const updateData = {
      ...data,
      ...(data.password ? { password: await hashPassword(data.password) } : {}),
    };
    delete updateData.password;

    const user = await userRepository.update(id, {
      ...updateData,
      ...(data.password ? { password: await hashPassword(data.password) } : {}),
    });

    return safeUser(user);
  }

  async deleteUser(id: number) {
    return deleteUserRecord(id);
  }
}
