"use client";

import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import type { User } from "@/types/user";

interface Props {
  user: User;
}

export default function UserMenu({
  user,
}: Props) {
  return (
    <Link
      href="/profile"
      className="flex items-center gap-3 rounded-xl bg-[#0B1026] px-4 py-2 transition hover:bg-[#106EE9]"
    >
      <Avatar
        name={user.name}
        avatar={user.avatar}
        size={36}
      />

      <div className="text-left">
        <p className="text-sm font-semibold text-white">
          {user.name}
        </p>

        <p className="text-xs text-gray-300">
          My Profile
        </p>
      </div>
    </Link>
  );
}