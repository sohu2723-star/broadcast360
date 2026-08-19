import { UserRepository } from "@/repositories/user.repository";
import { hashPassword, comparePassword } from "@/lib/password";
import { createToken } from "@/lib/jwt";
import { createUserToken } from "@/lib/user-jwt";
import {
  assertGmailAddress,
  createTemporaryPassword,
  isAllowedAdminEmail,
} from "@/lib/auth-policy";
import type { GoogleIdentity } from "@/lib/google-auth";

const userRepository = new UserRepository();

function publicUser(user: {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  avatar?: string | null;
  phone?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar ?? null,
    phone: user.phone ?? null,
    dateOfBirth: user.dateOfBirth ?? null,
    gender: user.gender ?? null,
  };
}

export class AuthService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    dateOfBirth?: Date;
    gender?: string;
    emailVerifiedAt?: Date;
  }) {
    const email = assertGmailAddress(data.email);
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error("Email already exists");

    const user = await userRepository.create({
      name: data.name,
      email,
      password: await hashPassword(data.password),
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      emailVerifiedAt: data.emailVerifiedAt,
      role: "USER",
    });
    return publicUser(user);
  }

  async login(email: string, password: string) {
    const normalizedEmail = assertGmailAddress(email);
    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user || user.role !== "ADMIN") throw new Error("Invalid admin credentials");
    if (user.status !== "ACTIVE") throw new Error("Account disabled");
    if (!(await comparePassword(password, user.password))) {
      throw new Error("Invalid admin credentials");
    }

    await userRepository.updateLastLogin(user.id);
    const token = await createToken({ id: user.id, email: user.email, role: "ADMIN" });
    return { token, user: publicUser(user) };
  }

  async userLogin(email: string, password: string) {
    const normalizedEmail = assertGmailAddress(email);
    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user || user.role === "ADMIN") throw new Error("Invalid user credentials");
    if (user.status !== "ACTIVE") throw new Error("Account disabled");
    if (!(await comparePassword(password, user.password))) {
      throw new Error("Invalid user credentials");
    }

    await userRepository.updateLastLogin(user.id);
    const token = await createUserToken({ id: user.id, email: user.email, role: "USER" });
    return { token, user: publicUser(user) };
  }

  async googleAdminLogin(identity: GoogleIdentity) {
    const email = assertGmailAddress(identity.email);
    if (!isAllowedAdminEmail(email)) {
      throw new Error("This Gmail account is not an allowed admin account");
    }

    const existing = await userRepository.findByEmail(email);
    const user = existing
      ? await userRepository.update(existing.id, {
          googleId: identity.googleId,
          name: identity.name,
          avatar: identity.avatar,
          role: "ADMIN",
          emailVerifiedAt: new Date(),
          status: "ACTIVE",
          lastLoginAt: new Date(),
        })
      : await userRepository.create({
          name: identity.name,
          email,
          password: await hashPassword(createTemporaryPassword()),
          googleId: identity.googleId,
          avatar: identity.avatar,
          emailVerifiedAt: new Date(),
          role: "ADMIN",
          status: "ACTIVE",
          lastLoginAt: new Date(),
        });

    const token = await createToken({ id: user.id, email: user.email, role: "ADMIN" });
    return { token, user: publicUser(user) };
  }

  async googleUserLogin(identity: GoogleIdentity) {
    const email = assertGmailAddress(identity.email);
    const existing = await userRepository.findByEmail(email);
    if (existing?.role === "ADMIN" || isAllowedAdminEmail(email)) {
      throw new Error("Admin accounts cannot login through the user portal");
    }

    const isNewUser = !existing;
    const user = existing
      ? await userRepository.update(existing.id, {
          googleId: identity.googleId,
          name: identity.name,
          avatar: identity.avatar,
          emailVerifiedAt: new Date(),
          status: "ACTIVE",
          lastLoginAt: new Date(),
        })
      : await userRepository.create({
          name: identity.name,
          email,
          password: await hashPassword(createTemporaryPassword()),
          googleId: identity.googleId,
          avatar: identity.avatar,
          emailVerifiedAt: new Date(),
          role: "USER",
          status: "ACTIVE",
          lastLoginAt: new Date(),
        });

    const token = await createUserToken({ id: user.id, email: user.email, role: "USER" });
    return { token, user: publicUser(user), isNewUser };
  }

  async updateProfile(
    id: number,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      avatar?: string;
      dateOfBirth?: Date;
      gender?: string;
    },
  ) {
    const user = await userRepository.updateProfile(id, data);
    return publicUser(user);
  }

  async changePassword(id: number, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new Error("User not found");
    if (!(await comparePassword(currentPassword, user.password))) {
      throw new Error("Current password incorrect");
    }
    await userRepository.update(id, { password: await hashPassword(newPassword) });
    return true;
  }
}
