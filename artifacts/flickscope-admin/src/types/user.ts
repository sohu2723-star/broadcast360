export type Role = 'ADMIN' | 'USER' | 'CREATOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';




export type UserQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role | "ALL";
  status?: UserStatus | "ALL";
};

export type UserSummary = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  phone: string | null;
  role: Role;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt?: Date;
};

export type User = UserSummary;
export type UserItemResponse = UserSummary;
export type GetUsersQuery = UserQueryParams;

export type UserSummaryStats = {
  totalUsers: number;
  totalAdmins: number;
  activeUsers: number;
  newThisMonth: number;
};

export type PaginatedUsersResponse = {
  data: UserItemResponse[];
  stats?: UserSummaryStats;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
