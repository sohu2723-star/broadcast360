import React, { useEffect, useState } from "react";
import { useLocation, useParams } from 'wouter';
import { Link } from 'wouter';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "ACTIVE" | "INACTIVE";
  phone?: string | null;
  avatar?: string | null; // 👈 Added avatar property from DB
  avatarUrl?: string | null; // 👈 Kept for fallback
  createdAt?: string;
};

export default function UserDetailPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const id = params?.id ? String(params.id) : null;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${id}`);
        const result = await res.json();

        if (result.success && result.user) {
          setUser(result.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this user?",
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setLocation("/users");
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  if (!id) return <div className="p-6 text-white">Invalid user ID</div>;
  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  if (!user) return <div className="p-6 text-white">No user found</div>;

  // Resolve image source dynamically
  const profileImage = user.avatar || user.avatarUrl;

  return (
    <div className="relative min-h-screen text-white">
      {/* MAIN CONTAINER */}
      <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0B1026] shadow-2xl">
        {/* Background Ambient Gradient */}
        <div className="absolute inset-0 h-80 bg-gradient-to-b from-indigo-900/30 via-[#0B1026]/80 to-[#0B1026] backdrop-blur-3xl" />

        {/* TOP NAVIGATION & ACTIONS */}
        <div className="relative z-10 flex items-center justify-between p-6 md:p-8">
          <button
            onClick={() => setLocation("/users")}
            className="group flex items-center gap-2 rounded-xl bg-black/40 px-4 py-2 text-sm font-medium text-gray-300 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>{" "}
            Back to Users
          </button>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link
              href={`/admin/users/${user.id}/edit`}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Profile
            </Link>

            <button
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-600/20 px-5 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-600 hover:text-white"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          </div>
        </div>

        {/* CENTERED PROFILE HEADER SECTION */}
        <div className="relative z-10 flex flex-col items-center px-6 pt-2 pb-8 text-center">
          {/* Centered Circle Avatar with standard img tag */}
          <div className="relative mb-5 flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-indigo-500/30 bg-slate-800/90 shadow-2xl ring-4 ring-indigo-500/10 transition duration-300 hover:scale-105">
            {profileImage ? (
              <img
                src={profileImage}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-6xl font-black text-indigo-400">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </span>
            )}
          </div>

          {/* User Name */}
          <h1 className="mb-2 text-3xl font-black tracking-tight text-white md:text-4xl">
            {user.name}
          </h1>

          {/* User Email */}
          <p className="mb-4 text-base font-medium text-gray-400">
            {user.email}
          </p>

          {/* Badges */}
          <div className="flex items-center gap-3">
            <span className="rounded border border-indigo-500/40 bg-indigo-500/20 px-3 py-1 text-xs font-bold tracking-widest text-indigo-300 uppercase">
              {user.role}
            </span>
            <span
              className={`rounded border px-3 py-1 text-xs font-bold tracking-widest ${
                user.status === "ACTIVE"
                  ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                  : "border-red-500/40 bg-red-500/20 text-red-400"
              }`}
            >
              ● {user.status || "ACTIVE"}
            </span>
          </div>
        </div>

        {/* METADATA GRID */}
        <div className="relative z-10 border-t border-white/10 px-6 py-8 md:px-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Role Card */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md">
              <p className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">
                System Role
              </p>
              <p className="mt-1 text-base font-semibold text-white">
                {user.role}
              </p>
            </div>

            {/* Email Card */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md">
              <p className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">
                Email Address
              </p>
              <p className="mt-1 truncate text-base font-semibold text-white">
                {user.email}
              </p>
            </div>

            {/* Phone Card */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md">
              <p className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">
                Phone Number
              </p>
              <p
                className={`mt-1 text-base font-semibold ${user.phone ? "text-white" : "text-gray-500 italic"}`}
              >
                {user.phone ? user.phone : "Not provided"}
              </p>
            </div>

            {/* Joined Date Card */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md">
              <p className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">
                Joined Date
              </p>
              <p className="mt-1 text-base font-semibold text-white">
                {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
