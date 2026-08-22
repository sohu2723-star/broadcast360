"use client";

export default function GuestMenu() {
  return (
    <div className="flex items-center gap-3">
      <a
        href="/login"
        className="rounded-lg border border-white/15 px-5 py-2 text-white transition hover:bg-[#2a2a2a]"
      >
        Login
      </a>

      <a
        href="/register"
        className="rounded-lg bg-[#2a2a2a] px-5 py-2 text-white transition hover:bg-[#363636]"
      >
        Register
      </a>
    </div>
  );
}
