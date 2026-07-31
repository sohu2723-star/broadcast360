import { UserRepository } from "@/repositories/user.repository";

import { hashPassword } from "@/lib/password";

import type { CreateUserInput, UpdateUserInput } from "@/types/user";

// Define the interface for query options
export interface GetUsersQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

const repository = new UserRepository();

export class UserService {
  async getUsers(options: GetUsersQueryOptions = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const search = options.search || "";
    const role = options.role || "";
    const status = options.status || "";

    // Delegate pagination and filtering to repository
    const { users, total } = await repository.findAll({
      page,
      limit,
      search,
      role,
      status,
    });

    // Strip passwords safely from result list
    const safeUsers = users.map((user) => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    return {
      users: safeUsers,
      total,
    };
  }

  async getUser(id: number) {
    const user = await repository.findById(id);

    if (!user) {
      return null;
    }

    const { password, ...safeUser } = user;

    return safeUser;
  }

  async createUser(data: CreateUserInput) {
    const existing = await repository.findByEmail(data.email);

    if (existing) {
      throw new Error("Email already exists");
    }

    const password = await hashPassword(data.password);

    const user = await repository.create({
      name: data.name,
      email: data.email,
      password,
      phone: data.phone ?? null,
      avatar: data.avatar ?? null,
      role: data.role ?? "USER",
      status: data.status ?? "ACTIVE",
    });

    const { password: removed, ...safeUser } = user;

    return safeUser;
  }

  async updateUser(id: number, data: UpdateUserInput) {
    const updateData = {
      ...data,
    };

    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    const user = await repository.update(id, updateData);

    const { password, ...safeUser } = user;

    return safeUser;
  }

  async deleteUser(id: number) {
    /*
      soft delete
    */
    return repository.update(id, {
      status: "INACTIVE",
    });
  }
}
