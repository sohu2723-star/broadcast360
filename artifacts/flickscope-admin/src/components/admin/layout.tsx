import { useLocation } from "wouter";
import { useState } from "react";

import Navbar from "@/components/admin/navbar";
import Sidebar from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pathname] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoginRoute =
    pathname === "/login" || pathname.startsWith("/login/") || pathname.startsWith("/user-login");

  // The login route must never inherit the authenticated Admin shell.
  if (isLoginRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#010312] text-white">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      {mobileOpen ? (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 lg:hidden"
          aria-label="Close admin navigation"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="min-w-0 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
