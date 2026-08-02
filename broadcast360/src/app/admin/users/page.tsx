"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Pagination from "@/components/admin/Pagination";

interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
}

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  // Filter & Search States
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Pagination State
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 5,
    total: 0,
  });

  /*
  ====================
  LOAD USERS (With Search, Filters & Pagination)
  ====================
  */
  const loadUsers = useCallback(
    async (page: number, search: string, role: string, status: string) => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: String(page),
          limit: String(pagination.limit),
        });

        if (search) params.append("search", search);
        if (role !== "ALL") params.append("role", role);
        if (status !== "ALL") params.append("status", status);

        const res = await fetch(`/api/users?${params.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch users");
        }

        // Handles data response with fallback totals
        setUsers(data.users ?? data.data ?? []);
        setPagination((prev) => ({
          ...prev,
          page: page,
          total: data.total ?? data.pagination?.total ?? 0,
        }));
      } catch (error) {
        console.error("LOAD USERS ERROR", error);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit],
  );

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      if (!isCancelled) {
        await loadUsers(
          pagination.page,
          searchEmail,
          selectedRole,
          selectedStatus,
        );
      }
    };

    void fetchData();

    return () => {
      isCancelled = true;
    };
  }, [loadUsers, pagination.page, searchEmail, selectedRole, selectedStatus]);

  // Input Handlers (resets page back to 1 on filter change)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchEmail(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  /*
  ====================
  DELETE USER
  ====================
  */
  async function deleteUser(id: number) {
    const confirmDelete = window.confirm("Disable this user?");

    if (!confirmDelete) return;

    try {
      setDeleteLoading(id);

      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      await loadUsers(
        pagination.page,
        searchEmail,
        selectedRole,
        selectedStatus,
      );
    } catch (error) {
      console.error("DELETE ERROR", error);
    } finally {
      setDeleteLoading(null);
    }
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  return (
    <div className="p-6 text-white">
      {/* Header & Controls Section */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>

        <button
          onClick={() => router.push("/admin/users/create")}
          className="rounded-lg bg-blue-600 px-5 py-3 whitespace-nowrap transition hover:bg-blue-700"
        >
          + Create User
        </button>
      </div>

      {/* SEARCH AND FILTER CONTROLS */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Email Search */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search user by email..."
            value={searchEmail}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-white/10 bg-[#0B1026] px-4 py-3 text-sm text-white placeholder-gray-500 transition focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Role Filter */}
        <select
          value={selectedRole}
          onChange={handleRoleChange}
          className="cursor-pointer rounded-xl border border-white/10 bg-[#0B1026] px-4 py-3 text-sm text-white transition focus:border-blue-500 focus:outline-none"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="USER">USER</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={handleStatusChange}
          className="cursor-pointer rounded-xl border border-white/10 bg-[#0B1026] px-4 py-3 text-sm text-white transition focus:border-blue-500 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="BANNED">BANNED</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111936]">
        <table className="w-full">
          <thead className="bg-[#0B1026]">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  Loading user list...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  No users found matching criteria
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-white/10 hover:bg-white/[0.02]"
                >
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4 text-gray-300">{user.email}</td>
                  <td className="p-4">
                    <span className="rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-1 text-xs text-blue-300">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs ${
                        user.status === "ACTIVE"
                          ? "border-green-500/30 bg-green-500/20 text-green-400"
                          : "border-red-500/30 bg-red-500/20 text-red-400"
                      }`}
                    >
                      ● {user.status}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="rounded-lg bg-[#106EE9] px-4 py-2 text-sm text-white transition hover:opacity-80"
                      >
                        Details
                      </Link>
                      <Link
                        href={`/admin/users/${user.id}/edit`}
                        className="rounded-lg bg-[#400FD3] px-4 py-2 text-sm text-white transition hover:opacity-80"
                      >
                        Edit
                      </Link>
                      <button
                        disabled={deleteLoading === user.id}
                        onClick={() => deleteUser(user.id)}
                        className="rounded-lg bg-[#F41010] px-4 py-2 text-sm text-white transition hover:opacity-80 disabled:opacity-50"
                      >
                        {deleteLoading === user.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <Pagination
        page={pagination.page}
        totalPages={totalPages}
        setPage={(newPage) => {
          const nextPg =
            typeof newPage === "function" ? newPage(pagination.page) : newPage;
          setPagination((prev) => ({ ...prev, page: nextPg }));
        }}
        loading={loading}
      />
    </div>
  );
}
