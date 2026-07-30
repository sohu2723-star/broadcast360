export type UserRole = "ADMIN" | "USER";

export type UserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "BANNED";

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