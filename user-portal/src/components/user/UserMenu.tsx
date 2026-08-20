"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Gem, Heart, History, LogOut, Settings, UserRound } from "lucide-react";

import Avatar from "@/components/ui/Avatar";
import type { User } from "@/types/user";
import authApi from "@/lib/authapi";
import { clearGoogleAutoSelect } from "@/lib/google-session";

interface Props {
  user: User;
}

export default function UserMenu({ user }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isPremium = user.subscription?.status === "ACTIVE";

  // Close when clicking outside
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
      clearGoogleAutoSelect();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* =====================================================
          PROFILE BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex
          items-center
          gap-3
          rounded-xl
          border
          border-white/10
          bg-[#0B1026]
          px-3
          py-2
          transition
          hover:border-white/15
          hover:bg-[#111936]
        "
      >
        {/* Avatar */}

        <div className="relative shrink-0">
          <Avatar
            name={user.name}
            avatar={user.avatar ?? undefined}
            size={36}
          />

          {/* Premium indicator */}

          {isPremium && (
            <span
              title="Premium Member"
              className="
                absolute
                -right-1
                -top-1
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-full
                border
                border-[#0B1026]
                bg-amber-400
                text-[#17120a]
                shadow-sm
              "
            >
              <Gem className="h-3 w-3" strokeWidth={2.5} />
            </span>
          )}
        </div>

        {/* User information */}

        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5">
              <p className="max-w-[130px] truncate text-sm font-semibold text-white sm:max-w-[130px]">
              {user.name}
            </p>


          </div>

          <p className="text-xs text-[#9fb3ca]">
            {isPremium ? "Premium Member" : "Account"}
          </p>
        </div>

        <ChevronDown
          className={`
            h-4
            w-4
            text-zinc-500
            transition-transform
            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* =====================================================
          DROPDOWN
      ===================================================== */}

      {open && (
        <div
          className="
            absolute
            right-0
            top-full
            z-50
            mt-3
            w-[min(18rem,calc(100vw-2rem))]
            overflow-hidden
            rounded-2xl
            border
            border-white/10
            bg-[#0B1026]
            shadow-2xl
            shadow-black/40
          "
        >
          {/* =================================================
              USER HEADER
          ================================================= */}



          {/* =================================================
              MENU
          ================================================= */}

          <div className="p-2">
            <MenuItem
              href="/profile"
              icon={<UserRound className="h-4 w-4" />}
              label="My Profile"
              onClick={() => setOpen(false)}
            />

            <MenuItem
              href="/subscription"
              icon={<Gem className="h-4 w-4" />}
              label="Subscription"
              onClick={() => setOpen(false)}
              premium={isPremium}
            />

            <MenuItem
              href="/profile/history"
              icon={<History className="h-4 w-4" />}
              label="Watch History"
              onClick={() => setOpen(false)}
            />

            <MenuItem
              href="/profile/favorites"
              icon={<Heart className="h-4 w-4" />}
              label="Favorites"
              onClick={() => setOpen(false)}
            />
          </div>

          {/* =================================================
              ACCOUNT
          ================================================= */}

          <div className="border-t border-white/10 p-2">
            <MenuItem
              href="/profile"
              icon={<Settings className="h-4 w-4" />}
              label="Account Settings"
              onClick={() => setOpen(false)}
            />

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
              <span className="flex h-6 w-6 items-center justify-center">
                <LogOut className="h-4 w-4" />
              </span>

              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MENU ITEM
========================================================= */

interface MenuItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  premium?: boolean;
}

function MenuItem({
  href,
  icon,
  label,
  onClick,
  premium,
}: MenuItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="
        flex
        items-center
        gap-3
        rounded-xl
        px-3
        py-3
        text-sm
        text-zinc-300
        transition
        hover:bg-white/[0.05]
        hover:text-white
      "
    >
      <span className="flex h-6 w-6 items-center justify-center text-zinc-500">
        {icon}
      </span>

      <span>{label}</span>

      {premium && (
        <Gem
          className="ml-auto h-3.5 w-3.5 text-amber-400"
          strokeWidth={2.5}
        />
      )}
    </Link>
  );
}