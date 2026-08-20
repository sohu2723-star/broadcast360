"use client";

import { useEffect, useState } from "react";

export default function InitialLoadOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#010312] text-white">
      <div className="flex items-center gap-3 rounded-2xl border border-cyan-200/10 bg-[#101b43]/90 px-5 py-4 text-sm text-slate-300 shadow-xl">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-r-cyan-200 border-t-cyan-100" aria-hidden="true" />
        Loading Hxu Movie...
      </div>
    </div>
  );
}
