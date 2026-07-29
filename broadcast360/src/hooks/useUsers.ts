import { useState, useEffect, useCallback } from "react";
import {
  PaginatedUsersResponse,
  GetUsersQuery,
  UserItemResponse,
} from "@/types/user";

export function useUsers() {
  const [filters, setFilters] = useState<GetUsersQuery>({
    page: 1,
    limit: 10,
    search: "",
    role: "ALL",
    status: "ALL",
  });

  const [data, setData] = useState<PaginatedUsersResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<UserItemResponse | null>(
    null,
  );
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserItemResponse | null>(
    null,
  );

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        page: String(filters.page ?? 1),
        limit: String(filters.limit ?? 10),
        ...(filters.search && { search: filters.search }),
        ...(filters.role && filters.role !== "ALL" && { role: filters.role }),
        ...(filters.status &&
          filters.status !== "ALL" && { status: filters.status }),
      });

      const res = await fetch(`/api/user?${query}`);
      if (!res.ok) throw new Error("Failed to fetch users");

      const result: PaginatedUsersResponse = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleView = (user: UserItemResponse) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/user/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      setUserToDelete(null);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  return {
    users: data?.data ?? [],
    stats: data?.stats,
    pagination: data?.pagination,
    loading,
    error,
    filters,
    setFilters,
    selectedUser,
    isViewOpen,
    setIsViewOpen,
    userToDelete,
    setUserToDelete,
    handleView,
    handleDelete,
    refetch: fetchUsers,
  };
}
