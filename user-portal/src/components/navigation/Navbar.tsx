"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import GuestMenu from "@/components/user/GuestMenu";
import UserMenu from "@/components/user/UserMenu";
import { getCurrentUser } from "@/lib/current-user";
import type { User } from "@/types/user";

const menus = [
  { name: "Movies", href: "/movies" },
  { name: "Series", href: "/series" },
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
        const currentUser = await getCurrentUser(attempt > 0);
        if (cancelled) return;
        setUser(currentUser);
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
    <header className="border-b border-white/10 bg-[#121212]">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="shrink-0 text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="text-[#7898bf]">Flick</span>Scope
        </Link>

        <div className="hidden items-center gap-5 lg:gap-7 md:flex">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={`relative whitespace-nowrap text-sm text-white transition hover:text-white/70 ${pathname === menu.href ? "text-white" : ""}`}
            >
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
                className={`rounded-lg px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10 ${pathname === menu.href ? "bg-white/10 text-white" : ""}`}
              >
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
