import type { Metadata } from "next";
import UserLayout from "@/components/UserLayout";
import InitialLoadOverlay from "@/components/InitialLoadOverlay";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlickScope",
  description: "FlickScope streaming and live television platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UserLayout>{children}</UserLayout>
        <InitialLoadOverlay />
      </body>
    </html>
  );
}
