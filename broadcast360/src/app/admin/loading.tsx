export default function AdminLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-white">
      <div className="flex items-center gap-3 rounded-2xl border border-cyan-200/10 bg-[#111936]/80 px-5 py-4 text-sm text-slate-300 shadow-xl">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-r-cyan-200 border-t-cyan-100" aria-hidden="true" />
        Loading admin workspace...
      </div>
    </div>
  );
}
