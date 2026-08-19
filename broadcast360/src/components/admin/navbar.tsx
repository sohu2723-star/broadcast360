"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

const menus = [
  { name: "Dashboard", path: "/admin" },
  { name: "Channels", path: "/admin/channels" },
  { name: "Broadcasts", path: "/admin/broadcasts" },
  { name: "Live Streams", path: "/admin/streams" },
  { name: "Movies", path: "/admin/movies" },
  { name: "Series", path: "/admin/series" },
  { name: "News", path: "/admin/news" },
  { name: "Entertainments", path: "/admin/entertainments" },
  { name: "Advertisements", path: "/admin/ads" },
  { name: "Programs", path: "/admin/programs" },
  { name: "Playlists", path: "/admin/playlists" },
  { name: "Schedules", path: "/admin/schedules" },

  // FIX
  { name: "Users", path: "/admin/users" },

  { name: "Settings", path: "/admin/settings" },
];

export default function Navbar() {
  const pathname = usePathname();

  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data.user);
        }
      } catch (error) {
        console.log(error);
      }
    }

    loadUser();
  }, []);

  function getTitle() {
  // Sort by path length descending so longer/more specific paths match first
  const menu = [...menus]
    .sort((a, b) => b.path.length - a.path.length)
    .find((item) => 
      item.path === "/admin" 
        ? pathname === "/admin" 
        : pathname.startsWith(item.path)
    );

  return menu?.name ?? "Admin";
}

  return (
    <header className="flex h-20 items-center justify-between border-b border-white/10 bg-[#010312] px-8">
      <h1 className="text-3xl font-semibold text-white">{getTitle()}</h1>

      {/* =================================================
          PROFILE
      ================================================= */}

      <div className="border-t border-white/10 p-4">
        <Link
          href="/admin/profile"
          className="
            flex
            items-center
            gap-3
            rounded-xl
            p-2
            transition
            hover:bg-white/5
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-full
              border
              border-white/20
              bg-[#111936]
            "
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || "Admin"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  bg-[#400FD3]
                  text-sm
                  font-bold
                  text-white
                "
              >
                {user?.name
                  ? user.name
                      .charAt(0)
                      .toUpperCase()
                  : "A"}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {user?.name || "Admin"}
            </p>

            <p className="truncate text-xs text-gray-500">
              {user?.role || "Administrator"}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
