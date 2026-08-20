"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect, useRef } from "react";

type AdminConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: AdminConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    cancelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onCancel();
      if (event.key === "Enter" && !loading) onConfirm();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#010312]/75 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onCancel();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-description"
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0B1026] p-6 text-white shadow-2xl shadow-black/40"
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              destructive
                ? "border-red-400/20 bg-red-400/10 text-red-300"
                : "border-[#7898bf]/20 bg-[#7898bf]/10 text-[#b9cbe0]"
            }`}
          >
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="admin-confirm-title" className="text-lg font-semibold">
              {title}
            </h2>
            <p id="admin-confirm-description" className="mt-2 text-sm leading-6 text-slate-300">
              {description}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            disabled={loading}
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
              destructive
                ? "bg-red-500/90 hover:bg-red-500"
                : "bg-[#4f6689] hover:bg-[#617fa8]"
            }`}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
