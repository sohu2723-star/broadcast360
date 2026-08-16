"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import Avatar from "@/components/ui/Avatar";
import type { User } from "@/types/user";
import authApi from "@/lib/authapi";

interface Props {
  user: User;
}

export default function UserMenu({ user }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function logout() {
    try {
      await authApi.post("/api/user-portal/auth/logout");

      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* =========================
          PROFILE BUTTON
      ========================= */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex
          items-center
          gap-3
          rounded-xl
          bg-[#0B1026]
          px-3
          py-2
          transition
          hover:bg-[#151d3d]
        "
      >
        <Avatar
          name={user.name}
          avatar={user.avatar}
          size={36}
        />

        <div className="hidden text-left sm:block">
          <p className="text-sm font-semibold text-white">
            {user.name}
          </p>

          <p className="text-xs text-gray-400">
            Account
          </p>
        </div>

        <span
          className={`text-xs text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {/* =========================
          POPUP
      ========================= */}
      {open && (
        <div
          className="
            absolute
            right-0
            top-full
            z-50
            mt-3
            w-72
            overflow-hidden
            rounded-2xl
            border
            border-white/10
            bg-[#0B1026]
            shadow-2xl
            shadow-black/40
          "
        >
          {/* USER HEADER */}
          <div className="border-b border-white/10 p-4">
            <div className="flex items-center gap-3">
              <Avatar
                name={user.name}
                avatar={user.avatar}
                size={48}
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user.name}
                </p>

                <p className="truncate text-xs text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* MENU */}
          <div className="p-2">

            {/* PROFILE */}
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="
                flex
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-sm
                text-gray-200
                transition
                hover:bg-white/5
                hover:text-white
              "
            >
              <span className="w-6 text-center text-lg">
                👤
              </span>

              <span>
                My Profile
              </span>
            </Link>

            {/* SUBSCRIPTION */}
            <Link
              href="/subscription"
              onClick={() => setOpen(false)}
              className="
                flex
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-sm
                text-gray-200
                transition
                hover:bg-white/5
                hover:text-white
              "
            >
              <span className="w-6 text-center text-lg">
                💎
              </span>

              <span>
                Subscription
              </span>
            </Link>

            {/* HISTORY */}
            <Link
              href="/profile/history"
              onClick={() => setOpen(false)}
              className="
                flex
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-sm
                text-gray-200
                transition
                hover:bg-white/5
                hover:text-white
              "
            >
              <span className="w-6 text-center text-lg">
                🕘
              </span>

              <span>
                Watch History
              </span>
            </Link>

            {/* FAVORITES */}
            <Link
              href="/profile/favorites"
              onClick={() => setOpen(false)}
              className="
                flex
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-sm
                text-gray-200
                transition
                hover:bg-white/5
                hover:text-white
              "
            >
              <span className="w-6 text-center text-lg">
                ❤️
              </span>

              <span>
                Favorites
              </span>
            </Link>
          </div>

          {/* ACCOUNT */}
          <div className="border-t border-white/10 p-2">

            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="
                flex
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-sm
                text-gray-200
                transition
                hover:bg-white/5
                hover:text-white
              "
            >
              <span className="w-6 text-center text-lg">
                ⚙️
              </span>

              <span>
                Account Settings
              </span>
            </Link>

            {/* LOGOUT */}
            <button
              type="button"
              onClick={logout}
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-left
                text-sm
                text-red-400
                transition
                hover:bg-red-500/10
              "
            >
              <span className="w-6 text-center text-lg">
                ↪
              </span>

              <span>
                Sign Out
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}