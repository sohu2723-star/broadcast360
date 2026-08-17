export type UserRole = "ADMIN" | "USER";

export type UserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "BANNED";

export type SubscriptionStatus =
  | "PENDING"
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED";

export interface UserSubscription {
  id: number;

  planId: number;

  optionId: number;

  status: SubscriptionStatus;

  planName: string | null;

  durationDays: number | null;

  price: number | null;

  discountPercent: number;

  createdAt?: string | null;

  startedAt?: string | null;

  expiresAt?: string | null;
}

export interface User {
  id: number;

  name: string;

  email: string;

  role: UserRole;

  status?: UserStatus;

  phone?: string | null;

  avatar?: string | null;

  avatarUrl?: string | null;

  createdAt?: string;

  // Current subscription
  subscription?: UserSubscription | null;
}

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