import React, { useEffect, useState } from "react";
import { UserItemResponse } from "@/types/user";
import { X, Calendar, Mail, Shield, Activity } from "lucide-react";

interface Props {
  userId: number | null;
  onClose: () => void;
}

export const UserDetailModal: React.FC<Props> = ({ userId, onClose }) => {
  const [user, setUser] = useState<UserItemResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/user/${userId}`)
      .then((res) => res.json())
      .then((data) => setUser(data.user ?? data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in-95 relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 transition-colors hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <div className="py-12 text-center text-slate-500">
            Loading details...
          </div>
        ) : user ? (
          <div>
            <div className="mb-6 flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 text-lg font-bold text-blue-400">
                {String(user.name).charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  {String(user.name)}
                </h3>
                <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-300">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-800 pt-4 text-sm text-slate-300">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-slate-500" />
                <span>{String(user.email)}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Activity className="h-4 w-4 text-slate-500" />
                <span>
                  Status:{" "}
                  <strong className="text-slate-100">{user.status}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span>
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-slate-500" />
                <span>
                  Last Login:{" "}
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString()
                    : "Never"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-red-400">
            Failed to load user.
          </div>
        )}
      </div>
    </div>
  );
};
