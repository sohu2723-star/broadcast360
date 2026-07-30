"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getUserById } from "@/services/user.service";
import type { User } from "@/types/user";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getUserById(Number(params.id));

        setUser(data);
      } catch {
        setError("Failed to load user");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadUser();
    }
  }, [params.id]);

  function handleLogout() {
    router.push("/");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-[#F41010]">{error}</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }
return (
  <main className="min-h-screen bg-black flex items-center justify-center p-5">

    <div className="w-full max-w-md rounded-2xl bg-[#0B1026] border border-gray-800 shadow-2xl p-5">


      {/* Profile Header */}

      <div className="flex items-center gap-4">


        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#106EE9] to-[#400FD3] flex items-center justify-center text-2xl font-bold text-white shadow-lg">

          {user.name.charAt(0).toUpperCase()}

        </div>



        <div className="flex-1">


          <h1 className="text-lg font-bold text-white">

            {user.name}

          </h1>



          <p className="mt-1 text-xs text-gray-400 break-all">

            {user.email}

          </p>



          <span className="inline-flex mt-2 rounded-full bg-[#1CFE10]/20 px-3 py-1 text-[11px] font-semibold text-[#1CFE10]">

            {user.status}

          </span>


        </div>


      </div>





      {/* Divider */}

      <div className="my-5 border-t border-gray-800" />





      {/* Account */}

      <h2 className="mb-3 text-sm font-semibold text-white">

        Account Details

      </h2>



      <div className="space-y-3">


        <Info
          label="Role"
          value={user.role}
        />



        <Info
          label="Created"
          value={formatDate(user.createdAt)}
        />



        <Info
          label="Last Login"
          value={
            user.lastLoginAt
              ? formatDate(user.lastLoginAt)
              : "Never"
          }
        />


      </div>





      {/* Actions */}

      <div className="mt-5 flex gap-3">


        <button
          onClick={() => router.push(`/profile/${user.id}/edit`)}
          className="flex-1 rounded-lg bg-[#106EE9] py-2.5 text-sm font-semibold text-white hover:bg-[#400FD3] transition"
        >
          Edit
        </button>



        <button
          onClick={handleLogout}
          className="flex-1 rounded-lg bg-[#F41010] py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
        >
          Logout
        </button>


      </div>


    </div>


  </main>
);
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between rounded-xl bg-black/30 px-4 py-3 border border-gray-800">
      <span className="text-sm text-gray-400">{label}</span>

      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}
