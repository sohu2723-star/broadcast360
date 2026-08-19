"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import GuestMenu from "@/components/user/GuestMenu";
import UserMenu from "@/components/user/UserMenu";
import authApi from "@/lib/authapi";
import type { User } from "@/types/user";

const menus = [
  { name: "Live TV", href: "/live-tv", live: true },
  { name: "Series", href: "/series" },
  { name: "Movies", href: "/movies" },
  { name: "Entertainment", href: "/entertainments" },
  { name: "News", href: "/news" },
  { name: "Schedule", href: "/schedule" },
  { name: "Contact Us", href: "/support" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUser(attempt = 0): Promise<void> {
      try {
        const response = await authApi.get("/api/user-portal/auth/me");
        if (cancelled) return;
        setUser(response.data?.user ?? null);
        setLoading(false);
      } catch (error) {
        if (cancelled) return;
        if (attempt < 2) {
          window.setTimeout(() => void loadUser(attempt + 1), 250);
          return;
        }
        console.error("Navbar auth check failed after retries:", error);
        setUser(null);
        setLoading(false);
      }
    }

    void loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function renderAccountMenu() {
    if (loading) {
      return <span className="h-9 w-20 animate-pulse rounded-xl bg-white/10" aria-label="Checking account" />;
    }
    return user ? <UserMenu user={user} /> : <GuestMenu />;
  }

  return (
    <header className="border-b border-[#0B1026] bg-[#010312]">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="shrink-0 text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="text-[#106EE9]">Broadcast</span>360
        </Link>

        <div className="hidden items-center gap-5 lg:gap-7 md:flex">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={`relative whitespace-nowrap text-sm text-white transition hover:text-[#106EE9] ${pathname === menu.href ? "text-[#106EE9]" : ""}`}
            >
              {menu.live ? <span className="mr-2 inline-block h-2 w-2 rounded-full bg-red-500" /> : null}
              {menu.name}
            </Link>
          ))}
        </div>

        <div className="hidden shrink-0 md:block">{renderAccountMenu()}</div>
        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-user-navigation"
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </nav>

      {mobileOpen ? (
        <div id="mobile-user-navigation" className="border-t border-white/10 bg-[#070c20] px-4 py-4 md:hidden">
          <div className="grid gap-2">
            {menus.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href}
                className={`rounded-xl px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10 ${pathname === menu.href ? "bg-blue-500/20 text-cyan-200" : ""}`}
              >
                {menu.live ? <span className="mr-2 inline-block h-2 w-2 rounded-full bg-red-500" /> : null}
                {menu.name}
              </Link>
            ))}
          </div>
          <div className="mt-4 border-t border-white/10 pt-4">{renderAccountMenu()}</div>
        </div>
      ) : null}
    </header>
  );
}
