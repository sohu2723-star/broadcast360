import React from "react";
import { UserSummaryStats } from "@/types/user";
import { Users, Shield, UserCheck, UserPlus } from "lucide-react";

interface Props {
  stats?: UserSummaryStats;
}

export const UserStatsCards: React.FC<Props> = ({ stats }) => {
  const items = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Admins",
      value: stats?.totalAdmins ?? 0,
      icon: Shield,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      label: "Active Users",
      value: stats?.activeUsers ?? 0,
      icon: UserCheck,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "New This Month",
      value: stats?.newThisMonth ?? 0,
      icon: UserPlus,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-4 shadow-lg backdrop-blur-sm"
          >
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                {item.label}
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-100">
                {item.value}
              </h3>
            </div>
            <div className={`rounded-xl border p-3 ${item.color}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
