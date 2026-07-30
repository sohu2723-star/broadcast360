"use client";

import Link from "next/link";

export default function GuestMenu() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="rounded-lg border border-[#106EE9] px-5 py-2 text-white hover:bg-[#106EE9]"
      >
        Login
      </Link>

      <Link
        href="/register"
        className="rounded-lg bg-[#106EE9] px-5 py-2 text-white hover:bg-blue-700"
      >
        Register
      </Link>
    </div>
  );
}
