"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    name: "Schedules",
    path: "/admin/schedules",
  },
  {
    name: "Programs",
    path: "/admin/programs",
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
    ],
  },

  {
    name: "Users",
    path: "/admin/users",
  },

  {
    name: "Settings",
    path: "/admin/settings",
  },
];

export default function Sidebar() {
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

      default:
        return 0;
    }
  }

  return (
    <aside
      className="
        sticky
        top-0
        flex
        h-screen
        w-64
        shrink-0
        flex-col
        border-r
        border-white/10
        bg-[#0B1026]
      "
    >
      {/* =================================================
          LOGO
      ================================================= */}

      <div className="px-5 pb-8 pt-6">
        <h1 className="text-2xl font-bold">
          <span className="text-[#106EE9]">
            Broadcast
          </span>
          360
        </h1>
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
                      ? "bg-[#106EE9] text-white shadow-lg shadow-blue-900/20"
                      : "text-gray-300 hover:bg-[#106EE9]/20 hover:text-white"
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
            <div key={menu.name}>
              {/* =================================================
                  GROUP BUTTON
              ================================================= */}

              <button
                type="button"
                onClick={() =>
                  setOpenMenu(
                    isOpen
                      ? null
                      : menu.name,
                  )
                }
                className={`
                  flex
                  w-full
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
                      ? "bg-[#106EE9]/20 text-white"
                      : "text-gray-300 hover:bg-[#106EE9]/20 hover:text-white"
                  }
                `}
              >
                <span>{menu.name}</span>

                <span
                  className={`
                    text-xs
                    transition-transform
                    ${
                      isOpen
                        ? "rotate-180"
                        : ""
                    }
                  `}
                >
                  ▼
                </span>
              </button>

              {/* =================================================
                  GROUP CHILDREN
              ================================================= */}

              {isOpen && (
                <div className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
                  {children.map((child) => {
                    const childActive =
                      isActive(child.path);

                    const badgeCount =
                      getBadgeCount(
                        child.name,
                      );

                    return (
                      <Link
                        key={child.path}
                        href={child.path}
                        className={`
                          flex
                          items-center
                          justify-between
                          rounded-lg
                          px-3
                          py-2.5
                          text-sm
                          transition
                          ${
                            childActive
                              ? "bg-[#106EE9] text-white"
                              : "text-gray-400 hover:bg-white/5 hover:text-white"
                          }
                        `}
                      >
                        <span>
                          {child.name}
                        </span>

                        {/* =================================================
                            NOTIFICATION BADGE
                        ================================================= */}

                        {badgeCount > 0 && (
                          <span
                            className="
                              ml-2
                              flex
                              min-h-[20px]
                              min-w-[20px]
                              items-center
                              justify-center
                              rounded-full
                              bg-red-500
                              px-1.5
                              text-[11px]
                              font-bold
                              leading-none
                              text-white
                            "
                          >
                            {badgeCount > 99
                              ? "99+"
                              : badgeCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}