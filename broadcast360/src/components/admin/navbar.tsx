"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

type NavbarProps = {
  onMenuClick: () => void;
};

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
  { name: "Users", path: "/admin/users" },
  { name: "Settings", path: "/admin/settings" },
];

export default function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
        const data = await response.json();
        if (!cancelled && response.ok) setUser(data.user);
      } catch (error) {
        if (!cancelled) console.error("Admin navbar auth check failed:", error);
      }
    }
    void loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  function getTitle() {
    const menu = [...menus]
      .sort((a, b) => b.path.length - a.path.length)
      .find((item) => (item.path === "/admin" ? pathname === "/admin" : pathname.startsWith(item.path)));
    return menu?.name ?? "Admin";
  }

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-[#010312]/95 px-4 backdrop-blur sm:min-h-20 sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onMenuClick} className="rounded-xl border border-white/10 p-2 text-slate-200 transition hover:bg-white/10 lg:hidden" aria-label="Open admin navigation">
          <Menu size={20} />
        </button>
        <h1 className="truncate text-xl font-semibold text-white sm:text-3xl">{getTitle()}</h1>
      </div>

      <Link href="/admin/profile" className="flex min-w-0 items-center gap-2 rounded-xl p-2 transition hover:bg-white/5 sm:gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-[#111936] sm:h-10 sm:w-10">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name || "Admin"} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#400FD3] text-sm font-bold text-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
          )}
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="max-w-[150px] truncate text-sm font-semibold text-white">{user?.name || "Admin"}</p>
          <p className="truncate text-xs text-gray-500">{user?.role || "Administrator"}</p>
        </div>
      </Link>
    </header>
  );
}
