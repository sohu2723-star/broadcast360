import { UserRepository } from "@/repositories/user.repository";

import { hashPassword } from "@/lib/password";

import type { CreateUserInput, UpdateUserInput } from "@/types/user";

const repository = new UserRepository();

export class UserService {
  async getUsers() {
    const users = await repository.findAll();

    return users.map((user) => {
      const { password, ...safeUser } = user;

      return safeUser;
    });
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
