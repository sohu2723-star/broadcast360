export type UserRole = "ADMIN" | "USER";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status?: string;
  phone?: string | null;
  avatar?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
}

export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  avatar?: string;
  role?: UserRole;
  status?: UserStatus;
}
