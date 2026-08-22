import React from "react";
import { Search } from "lucide-react";
import { Role, UserStatus, GetUsersQuery } from "@/types/user";

interface Props {
  filters: GetUsersQuery;
  setFilters: React.Dispatch<React.SetStateAction<GetUsersQuery>>;
}

export const UserControls: React.FC<Props> = ({ filters, setFilters }) => {
  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={filters.search ?? ""}
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))
          }
          className="w-full rounded-lg border border-slate-800 bg-slate-900/80 py-2 pr-4 pl-9 text-sm text-slate-200 placeholder-slate-500 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
        />
      </div>

      {/* Role & Status Dropdowns */}
      <div className="flex w-full gap-3 sm:w-auto">
        <select
          value={filters.role ?? "ALL"}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              role: e.target.value as Role | "ALL",
              page: 1,
            }))
          }
          className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </select>

        <select
          value={filters.status ?? "ALL"}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              status: e.target.value as UserStatus | "ALL",
              page: 1,
            }))
          }
          className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="BANNED">Banned</option>
        </select>
      </div>
    </div>
  );
};
