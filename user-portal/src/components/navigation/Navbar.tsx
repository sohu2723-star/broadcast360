"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import UserMenu from "@/components/user/UserMenu";
import GuestMenu from "@/components/user/GuestMenu";

import type { User } from "@/types/user";
import authApi from "@/lib/authapi";
const menus = [
  {
    name: "Live TV",
    href: "/live-tv",
    live: true,
  },
  {
    name: "Series",
    href: "/series",
  },
  {
    name: "Movies",
    href: "/movies",
  },
  {
    name: "News",
    href: "/news",
  },
  {
    name: "Entertainment",
    href: "/entertainments",
  },
];

export default function Navbar() {
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await authApi.get("/api/user-portal/auth/me");

        if (response.data?.user) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log("Not authenticated");

        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return (
    <header className="bg-[#010312] border-b border-[#0B1026]">
      <nav
        className="
max-w-7xl
mx-auto
px-6
py-4
flex
items-center
justify-between
"
      >
        <h1 className="text-2xl font-bold">
          <span className="text-[#106EE9]">Broadcast</span>
          360
        </h1>

        <div className="hidden md:flex gap-8">
          {menus.map((menu) => (
            <Link
              key={menu.href}

              href={menu.href}

              className={`
text-white
relative

${pathname === menu.href ? "text-[#106EE9]" : "hover:text-[#106EE9]"}

`}
            >
              {menu.live && (
                <span
                  className="
inline-block
w-2
h-2
bg-red-500
rounded-full
mr-2
"
                />
              )}

              {menu.name}
            </Link>
          ))}
        </div>

        <div>
          {loading ? null : user ? <UserMenu user={user} /> : <GuestMenu />}
        </div>
      </nav>
    </header>
  );
}