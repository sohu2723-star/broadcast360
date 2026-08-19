"use client";

import { usePathname } from "next/navigation";

import Footer from "./footer";
import Navbar from "./navigation/Navbar";

const AUTH_ROUTES = new Set(["/login", "/register", "/google-complete"]);

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  if (isAuthRoute) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
