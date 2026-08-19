"use client";

import Link from "next/link";

export default function GuestMenu() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="rounded-lg border border-[#4f6689] px-5 py-2 text-white hover:bg-[#4f6689]"
      >
        Login
      </Link>

      <Link
        href="/register"
        className="rounded-lg bg-[#4f6689] px-5 py-2 text-white hover:bg-[#7898bf]/30"
      >
        Register
      </Link>
    </div>
  );
}
