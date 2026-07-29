import {
  getUsers,
  getPaginatedUsers,
  getUserById,
  deleteUser,
} from "@/repositories/user.repository";
import { Role, UserStatus } from "@/generated/prisma";

/*  GET */
export async function fetchUsers() {
  return getUsers();
}

/**
 * Get paginated users list with search, filters, and summary metrics
 */
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
  const validatedLimit = Math.max(1, limit);

  const { data, total, stats } = await getPaginatedUsers({
    page: validatedPage,
    limit: validatedLimit,
    search,
    role,
    status,
  });

  const totalPages = Math.ceil(total / validatedLimit) || 1;

  return {
    data,
    stats,
    pagination: {
      page: validatedPage,
      limit: validatedLimit,
      total,
      totalPages,
    },
  };
}

/**
 * Get single user by ID (for View Action)
 */
export async function fetchUserById(id: number) {
  return getUserById(id);
}

/* =========================
   DELETE
========================= */
export async function removeUser(id: number) {
  return deleteUser(id);
}
