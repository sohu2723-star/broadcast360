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
  { name: "Live Streams", path: "/admin/streams" },
  { name: "Movies", path: "/admin/movies" },
  { name: "Series", path: "/admin/series" },
  { name: "News", path: "/admin/news" },
  { name: "Entertainments", path: "/admin/entertainments" },
  { name: "Advertisements", path: "/admin/ads" },
  { name: "Programs", path: "/admin/programs" },
  { name: "Playlists", path: "/admin/playlists" },
  { name: "Schedules", path: "/admin/schedules" },
  { name: "Recordings", path: "/admin/recordings" },

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
    if (pathname === "/admin") return "Dashboard";

    const menu = menus.find((item) => pathname.startsWith(item.path));

    return menu?.name ?? "Admin";
  }

  return (
    <header className="flex h-20 items-center justify-between border-b border-white/10 bg-[#010312] px-8">
      <h1 className="text-3xl font-semibold text-white">{getTitle()}</h1>

      <div className="flex items-center gap-3 rounded-xl bg-[#111936] px-4 py-2">
        <Link
          href="/admin/profile"
          className="flex items-center gap-3 rounded-xl bg-[#111936] px-4 py-2 transition hover:bg-[#18224d]"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#400FD3] font-bold text-white">
              {user?.name?.charAt(0) ?? "A"}
            </div>
          )}

          <div>
            <p className="font-semibold text-white">{user?.name ?? "Admin"}</p>

            <p className="text-xs text-gray-400">{user?.role ?? "ADMIN"}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
