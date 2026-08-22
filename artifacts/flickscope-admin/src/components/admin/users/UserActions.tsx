import React from "react";
import { Link } from "wouter";
import { Edit3, Eye, Trash2 } from "lucide-react";
import { UserItemResponse } from "@/types/user";

interface Props {
  user: UserItemResponse;
  onView: (user: UserItemResponse) => void;
  onDelete: (user: UserItemResponse) => void;
}

export const UserActions: React.FC<Props> = ({ user, onView, onDelete }) => {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => onView(user)}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-700/50 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-blue-400 transition-all hover:bg-slate-700 hover:text-blue-300"
      >
        <Eye className="h-3.5 w-3.5" />
        Details
      </button>
      <Link
        href={`/admin/users/${user.id}/edit`}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-700/50 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-slate-700 hover:text-white"
      >
        <Edit3 className="h-3.5 w-3.5" />
        Edit
      </Link>
      <button
        onClick={() => onDelete(user)}
        className="inline-flex items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  );
};
