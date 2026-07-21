"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User, X } from "lucide-react";
import { useState } from "react";

const menus = [
  {
    name: "Live TV",
    href: "/live-tv",
    live: true,
  },
  {
    name: "Series",
    href: "/series",
    live: false,
  },
  {
    name: "Movies",
    href: "/movies",
    live: false,
  },
  {
    name: "News",
    href: "/news",
    live: false,
  },
  {
    name: "Live Record",
    href: "/live-record",
    live: false,
  },
];

export default function Navbar() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  return (
    <header className="bg-[#010312] border-b border-[#0B1026]">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-2xl font-bold">
          <span className="text-[#106EE9]">Broadcast</span>
          360
        </h1>

        {/* Desktop Navigation */}

        <div className="hidden md:flex items-center gap-8">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={`relative flex items-center gap-2 text-white transition ${
                pathname === menu.href
                  ? "text-[#106EE9]"
                  : "hover:text-[#106EE9]"
              }`}
            >
              {menu.live && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#F41010]"></span>
              )}

              {menu.name}

              {pathname === menu.href && (
                <span className="absolute left-0 -bottom-2 w-full h-1 bg-[#106EE9] rounded" />
              )}
            </Link>
          ))}
        </div>

        {/* Profile Desktop */}

        <div className="hidden md:flex">
          <Link
            href="/profile"
            className="flex items-center gap-2 bg-[#0B1026] text-white px-4 py-2 rounded-lg hover:bg-[#106EE9]"
          >
            <User size={18} />
            Profile
          </Link>
        </div>

        {/* Mobile Button */}

        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}

      {open && (
        <div className="md:hidden bg-[#0B1026] px-6 py-5">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              onClick={() => setOpen(false)}
              className={`block py-3 text-white ${
                pathname === menu.href ? "text-[#106EE9]" : ""
              }`}
            >
              {menu.name}
            </Link>
          ))}

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 py-3 text-white"
          >
            <User size={18} />
            Profile
          </Link>
        </div>
      )}
    </header>
  );
}
