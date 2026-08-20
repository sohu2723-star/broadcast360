"use client";

import React from "react";
import { useUsers } from "@/hooks/useUsers";
import { UserStatsCards } from "@/components/admin/users/UserStatsCards";
import { UserDetailModal } from "@/components/admin/users/UserDetailModel";
import { UserControls } from "@/components/admin/users/UserControls";
import { UserActions } from "@/components/admin/users/UserActions";
import { DeleteConfirmModal } from "@/components/admin/users/DeleteConfirmModal";
import Link from "next/link";
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
    canCreateAccounts,
  } = useUsers();

  return (
    <div className="min-h-screen bg-[#0b0f19] p-6 text-slate-100 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">User List</h2>
            <p className="mt-1 text-sm text-slate-400">Manage registered users and account status.</p>
          </div>
          {canCreateAccounts ? (
            <Link
              href="/admin/users/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4f6689] to-[#7898bf] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#4f6689]/20 transition hover:opacity-90"
            >
              <UserPlus className="h-4 w-4" />
              Create Account
            </Link>
          ) : (
            <button
              type="button"
              disabled
              title="Only the configured server-mail admin can create accounts"
              className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-500 opacity-70"
            >
              <UserPlus className="h-4 w-4" />
              Create Account
            </button>
          )}
        </div>

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
                <th className="px-4 py-3.5">Last Login</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
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
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
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
