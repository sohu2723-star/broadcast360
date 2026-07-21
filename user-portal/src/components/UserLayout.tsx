import Navbar from "./navigation/Navbar";
import Footer from "./footer";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1">{children}</div>

      <Footer />
    </div>
  );
}
