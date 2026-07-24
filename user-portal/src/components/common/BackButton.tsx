"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="mb-6 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800"
    >
      ← Back
    </button>
  );
}
