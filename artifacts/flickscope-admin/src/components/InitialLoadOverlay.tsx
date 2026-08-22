import { useEffect, useState } from "react";

export default function InitialLoadOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#121212]/96 px-5 text-white backdrop-blur-sm" role="status" aria-live="polite">
      <div className="flex w-full max-w-xs flex-col items-center rounded-3xl border border-white/10 bg-[#1f1f1f]/96 px-7 py-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/15 border-r-white/80 border-t-white" aria-hidden="true" />
        <p className="mt-4 text-sm font-semibold">Loading FlickScope...</p>
        <p className="mt-1 text-xs text-slate-400">Please wait a moment</p>
      </div>
    </div>
  );
}
