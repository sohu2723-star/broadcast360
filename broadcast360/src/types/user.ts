import { Role, UserStatus } from "@/generated/prisma/client";

// Re-export Prisma Enums for clean frontend imports
export { Role, UserStatus };

/* =========================
   QUERY PARAMS
========================= */
export interface GetUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role | "ALL";
  status?: UserStatus | "ALL";
}

/* =========================
   SUMMARY STATS
========================= */
export interface UserSummaryStats {
  totalUsers: number;
  totalAdmins: number;
  activeUsers: number;
  newThisMonth: number;
}

/* =========================
   USER ITEM
========================= */
export interface UserItemResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  lastLoginAt: string | Date | null;
  createdAt: string | Date;
}

/* =========================
   PAGINATION METADATA
========================= */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/* =========================
   API RESPONSE WRAPPER
========================= */
export interface PaginatedUsersResponse {
  data: UserItemResponse[];
  stats: UserSummaryStats;
  pagination: PaginationMeta;
}
