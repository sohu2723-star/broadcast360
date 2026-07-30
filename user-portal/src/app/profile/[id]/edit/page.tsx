"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getUserById, updateUser } from "@/services/user.service";

export default function EditProfilePage() {
  const params = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const user = await getUserById(Number(params.id));

        setName(user.name);
        setEmail(user.email);
      } catch {
        console.error("Failed to load user");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      load();
    }
  }, [params.id]);

  async function handleSave() {
    try {
      setSaving(true);

      await updateUser(Number(params.id), {
        name,
        email,
      });

      router.push(`/profile/${params.id}`);
    } catch {
      console.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#010312] text-white">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#010312] p-30">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-800 bg-[#0B1026] p-6">
        <h1 className="mb-5 text-xl font-bold text-white">Edit Profile</h1>

        <div className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-[#010312] px-4 py-3 text-white outline-none focus:border-[#106EE9]"
            placeholder="Name"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-[#010312] px-4 py-3 text-white outline-none focus:border-[#106EE9]"
            placeholder="Email"
          />

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-lg bg-[#106EE9] py-3 text-white transition hover:bg-[#400FD3] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={() => router.back()}
              className="flex-1 rounded-lg bg-gray-700 py-3 text-white transition hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
