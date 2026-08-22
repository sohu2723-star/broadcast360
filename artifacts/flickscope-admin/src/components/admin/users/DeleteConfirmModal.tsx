import React from "react";
import { UserItemResponse } from "@/types/user";

interface Props {
  user: UserItemResponse | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
}

export const DeleteConfirmModal: React.FC<Props> = ({
  user,
  onClose,
  onConfirm,
}) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in-95 relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl duration-150">
        <h3 className="mb-2 text-lg font-bold text-slate-100">
          Confirm Delete
        </h3>
        <p className="mb-6 text-sm text-slate-400">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-200">
            {String(user.name)}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(user.id)}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
