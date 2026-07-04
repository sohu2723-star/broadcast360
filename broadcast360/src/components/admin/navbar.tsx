"use client";

import { usePathname } from "next/navigation";

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
  { name: "Users", path: "/admin/user" },
  { name: "Settings", path: "/admin/settings" },
];

export default function Navbar() {
  const pathname = usePathname();

  const getActiveMenu = () => {
    // exact dashboard match
    if (pathname === "/admin") return "Dashboard";

    // nested routes handling (important fix)
    const matched = menus
      .filter((m) => m.path !== "/admin")
      .find((m) => pathname.startsWith(m.path));

    return matched?.name;
  };

  const currentMenuName = getActiveMenu();

  return (
    <header className="h-20 bg-[#010312] border-b border-white/10 flex items-center justify-between px-8 sticky top-0 z-50">
      
      {/* Page Title */}
      <h1 className="text-3xl font-semibold text-white">
        {currentMenuName || "Admin"}
      </h1>

      {/* Admin Info */}
      <div className="flex items-center gap-6">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full bg-[#400FD3] flex items-center justify-center text-white">
            A
          </div>
          <div className="text-white">Admin</div>
        </div>
      </div>
    </header>
  );
}