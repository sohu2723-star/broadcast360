"use client";

import React from "react";
import { useUsers } from "@/hooks/useUsers";
import { UserStatsCards } from "@/components/admin/users/UserStatsCards";
import { UserDetailModal } from "@/components/admin/users/UserDetailModel";
import { UserControls } from "@/components/admin/users/UserControls";
import { UserActions } from "@/components/admin/users/UserActions";
import { DeleteConfirmModal } from "@/components/admin/users/DeleteConfirmModal";
import { ChevronLeft, ChevronRight, UserPlus } from "lucide-react";

export default function UsersPage() {
  const {
    users,
    stats,
    pagination,
    loading,
    filters,
    setFilters,
    selectedUser,
    isViewOpen,
    setIsViewOpen,
    userToDelete,
    setUserToDelete,
    handleView,
    handleDelete,
  } = useUsers();

  return (
    <div className="min-h-screen bg-[#0b0f19] p-6 text-slate-100 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Stats Cards */}
        <UserStatsCards stats={stats} />

        {/* Search & Filter Component */}
        <UserControls filters={filters} setFilters={setFilters} />

        {/* Data Table */}
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 shadow-xl backdrop-blur-sm">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 font-semibold tracking-wider text-slate-400 uppercase">
                <th className="px-4 py-3.5">User</th>
                <th className="px-4 py-3.5">Gmail</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Joined</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-slate-800/30"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-100">
                        {String(user.name)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-400">
                        {String(user.email)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "border-purple-500/20 bg-purple-500/10 text-purple-400"
                            : "border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                          user.status === "ACTIVE"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : user.status === "BANNED"
                              ? "border-red-500/20 bg-red-500/10 text-red-400"
                              : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {/* Action buttons component */}
                      <UserActions
                        user={user}
                        onView={handleView}
                        onDelete={setUserToDelete}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          {pagination && (
            <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/80 px-4 py-3.5 text-xs text-slate-400">
              <span>
                Page {pagination.page} of {pagination.totalPages} (
                {pagination.total} total)
              </span>
              <div className="flex space-x-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))
                  }
                  className="rounded-lg border border-slate-700/50 bg-slate-800 p-1.5 text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))
                  }
                  className="rounded-lg border border-slate-700/50 bg-slate-800 p-1.5 text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View Modal */}
        <UserDetailModal
          userId={isViewOpen && selectedUser ? selectedUser.id : null}
          onClose={() => setIsViewOpen(false)}
        />

        {/* Delete Modal Component */}
        <DeleteConfirmModal
          user={userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
}
