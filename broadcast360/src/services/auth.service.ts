import { UserRepository } from "@/repositories/user.repository";

import { hashPassword, comparePassword } from "@/lib/password";

import { createToken } from "@/lib/jwt";

import { createUserToken } from "@/lib/user-jwt";

const userRepository = new UserRepository();

export class AuthService {
  async register(data: { name: string; email: string; password: string }) {
    const existing = await userRepository.findByEmail(data.email);

    if (existing) {
      throw new Error("Email already exists");
    }

    const hashed = await hashPassword(data.password);

    const user = await userRepository.create({
      name: data.name,

      email: data.email,

      password: hashed,

      role: "USER",
    });

    return {
      id: user.id,

      name: user.name,

      email: user.email,
    };
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (user.status !== "ACTIVE") {
      throw new Error("Account disabled");
    }

    const valid = await comparePassword(password, user.password);

    if (!valid) {
      throw new Error("Invalid credentials");
    }

    await userRepository.updateLastLogin(user.id);

    const token = await createToken({
      id: user.id,

      email: user.email,

      role: user.role,
    });

    return {
      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
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
    const user = await userRepository.updateProfile(id, data);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
    };
  }

  async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    const valid = await comparePassword(currentPassword, user.password);

    if (!valid) {
      throw new Error("Current password incorrect");
    }

    const hashed = await hashPassword(newPassword);

    await userRepository.update(id, {
      password: hashed,
    });

    return true;
  }

   async userLogin(email: string, password: string) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (user.status !== "ACTIVE") {
      throw new Error("Account disabled");
    }

    const valid = await comparePassword(password, user.password);

    if (!valid) {
      throw new Error("Invalid credentials");
    }

    await userRepository.updateLastLogin(user.id);

    const token = await createUserToken({
      id: user.id,

      email: user.email,

      role: "USER",
    });

    return {
      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
