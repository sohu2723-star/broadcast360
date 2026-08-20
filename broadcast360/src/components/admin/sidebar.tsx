"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

interface MenuItem {
  name: string;
  path?: string;
  children?: SubMenuItem[];
}

interface SubMenuItem {
  name: string;
  path: string;
}

const menus: MenuItem[] = [
  {
    name: "Dashboard",
    path: "/admin",
  },
  {
    name: "Broadcast",
    path: "/admin/broadcast",
  },
  {
    name: "TV Control",
    path: "/admin/tv",
  },
  {
    name: "Channels",
    path: "/admin/channels",
  },
  {
    name: "Programs",
    path: "/admin/programs",
  },
  {
    name: "Schedules",
    path: "/admin/schedules",
  },
  {
    name: "Live Streams",
    path: "/admin/streams",
  },

  // =====================================================
  // CONTENT
  // =====================================================

  {
    name: "Content",
    children: [
      {
        name: "Movies",
        path: "/admin/movies",
      },
      {
        name: "Series",
        path: "/admin/series",
      },
      {
        name: "News",
        path: "/admin/news",
      },
      {
        name: "Entertainment",
        path: "/admin/entertainments",
      },
      {
        name: "Advertisements",
        path: "/admin/ads",
      },
    ],
  },

  // =====================================================
  // SUBSCRIPTIONS
  // =====================================================

  {
    name: "Subscriptions",
    children: [
      {
        name: "Subscriptions",
        path: "/admin/subscriptions",
      },
      {
        name: "Plans",
        path: "/admin/subscription-plans",
      },
      {
        name: "Options",
        path: "/admin/subscription-options",
      },
      {
        name: "Payments",
        path: "/admin/payments",
      },
    ],
  },

  // =====================================================
  // SUPPORT
  // =====================================================

  {
    name: "Support",
    children: [
      {
        name: "Contact Messages",
        path: "/admin/support/contacts",
      },
      {
        name: "Premium Chats",
        path: "/admin/support/chats",
      },
      {
        name: "Reactivation Requests",
        path: "/admin/support/reactivation",
      },
    ],
  },

  {
    name: "Users",
    path: "/admin/users",
  },
];

export default function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const [user, setUser] = useState<AdminUser | null>(null);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // =====================================================
  // NOTIFICATION COUNTS
  // =====================================================

  const [pendingPaymentCount, setPendingPaymentCount] =
    useState(0);

  const [supportCount, setSupportCount] = useState({
    contactMessages: 0,
    premiumChats: 0,
    reactivationRequests: 0,
  });

  // =====================================================
  // LOAD ADMIN USER
  // =====================================================

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data.user);
        }
      } catch (error) {
        console.error(
          "Failed to load admin user:",
          error,
        );
      }
    }

    loadUser();
  }, []);

  // =====================================================
  // LOAD NOTIFICATION COUNTS
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadNotificationCounts() {
      // ---------------------------------------------------
      // PENDING PAYMENTS
      // ---------------------------------------------------

      try {
        const res = await fetch(
          "/api/payments/pending-count",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        if (res.ok) {
          const data = await res.json();

          if (!cancelled) {
            setPendingPaymentCount(
              Number(data.count) || 0,
            );
          }
        } else {
          console.error(
            "Failed to load pending payment count:",
            res.status,
          );
        }
      } catch (error) {
        console.error(
          "Failed to load pending payment count:",
          error,
        );
      }

      // ---------------------------------------------------
      // SUPPORT COUNTS
      // ---------------------------------------------------

      try {
        const res = await fetch(
          "/api/support/pending-count",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        if (res.ok) {
          const data = await res.json();

          if (!cancelled) {
            setSupportCount({
              contactMessages:
                Number(data.contactMessages) || 0,

              premiumChats:
                Number(data.premiumChats) || 0,
              reactivationRequests:
                Number(data.reactivationRequests) || 0,
            });
          }
        } else {
          console.error(
            "Failed to load support count:",
            res.status,
          );
        }
      } catch (error) {
        console.error(
          "Failed to load support count:",
          error,
        );
      }
    }

    loadNotificationCounts();

    // Refresh every 30 seconds
    const interval = setInterval(
      loadNotificationCounts,
      30000,
    );

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // =====================================================
  // AUTO OPEN ACTIVE GROUP
  // =====================================================

  useEffect(() => {
    const activeGroup = menus.find((menu) =>
      menu.children?.some((child) =>
        pathname.startsWith(child.path),
      ),
    );

    if (activeGroup) {
      setOpenMenu(activeGroup.name);
    }
  }, [pathname]);

  // =====================================================
  // CHECK ACTIVE SINGLE ITEM
  // =====================================================

  function isActive(path: string) {
    if (path === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(path);
  }

  // =====================================================
  // CHECK ACTIVE GROUP
  // =====================================================

  function isGroupActive(
    children: SubMenuItem[],
  ) {
    return children.some((child) =>
      pathname.startsWith(child.path),
    );
  }

  // =====================================================
  // GET BADGE COUNT
  // =====================================================

  function getBadgeCount(
    childName: string,
  ) {
    switch (childName) {
      case "Payments":
        return pendingPaymentCount;

      case "Contact Messages":
        return supportCount.contactMessages;

      case "Premium Chats":
        return supportCount.premiumChats;

      case "Reactivation Requests":
        return supportCount.reactivationRequests;

      default:
        return 0;
    }
  }

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 h-screen w-72 overflow-y-auto border-r border-white/10 bg-[#0B1026] p-4 transition-transform duration-200 lg:sticky lg:z-auto lg:w-64 lg:translate-x-0 lg:p-5 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="mb-6 flex items-center justify-between lg:mb-10">
        <h1 className="text-2xl font-bold">
          <span className="text-[#4f6689]">Broadcast</span>360
        </h1>
        <button type="button" onClick={onClose} className="rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/10 lg:hidden" aria-label="Close admin navigation">Close</button>
      </div>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
        {menus.map((menu) => {
          // =================================================
          // SINGLE MENU ITEM
          // =================================================

          if (menu.path) {
            const active = isActive(menu.path);

            return (
              <Link
                key={menu.path}
                href={menu.path}
                onClick={onClose}
                className={`
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-medium
                  transition
                  ${
                    active
                      ? "bg-[#4f6689] text-white shadow-lg shadow-black/20"
                      : "text-gray-300 hover:bg-[#7898bf]/12 hover:text-white"
                  }
                `}
              >
                <span>{menu.name}</span>
              </Link>
            );
          }

          // =================================================
          // GROUP MENU
          // =================================================

          const children = menu.children ?? [];

          const active = isGroupActive(children);

          const isOpen =
            openMenu === menu.name;

          return (
            <div key={menu.name} className="space-y-1">
              <button
                type="button"
                onClick={() => setOpenMenu((current) => (current === menu.name ? null : menu.name))}
                aria-expanded={isOpen}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? "bg-[#7898bf]/15 text-white"
                    : "text-gray-300 hover:bg-[#7898bf]/12 hover:text-white"
                }`}
              >
                <span>{menu.name}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen ? (
                <div className="ml-3 space-y-1 border-l border-white/10 pl-3">
                  {children.map((child) => {
                    const childActive = isActive(child.path);
                    const badgeCount = getBadgeCount(child.name);
                    return (
                      <Link
                        key={child.path}
                        href={child.path}
                        onClick={onClose}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                          childActive
                            ? "bg-[#4f6689] text-white shadow-lg shadow-black/20"
                            : "text-gray-400 hover:bg-[#7898bf]/12 hover:text-white"
                        }`}
                      >
                        <span>{child.name}</span>
                        {badgeCount > 0 ? (
                          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
                            {badgeCount > 99 ? "99+" : badgeCount}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
