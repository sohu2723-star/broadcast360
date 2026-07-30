"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;

  name: string;

  email: string;

  role: "ADMIN" | "USER";

  status: "ACTIVE" | "INACTIVE" | "BANNED";

  createdAt: string;
}

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  /*
====================
LOAD USERS
====================
*/

  async function loadUsers() {
    try {
      setLoading(true);

      const res = await fetch("/api/users");

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setUsers(data.users ?? []);
    } catch (error) {
      console.error("LOAD USERS ERROR", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  /*
====================
DELETE USER
====================
*/

  async function deleteUser(id: number) {
    const confirmDelete = window.confirm("Disable this user?");

    if (!confirmDelete) return;

    try {
      setDeleteLoading(id);

      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      await loadUsers();
    } catch (error) {
      console.error("DELETE ERROR", error);
    } finally {
      setDeleteLoading(null);
    }
  }

  return (
    <div className="p-6 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>

        <button
          onClick={() => router.push("/admin/users/create")}

          className="rounded-lg bg-blue-600 px-5 py-3 hover:bg-blue-700"
        >
          + Create User
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111936]">
        <table className="w-full">
          <thead className="bg-[#0B1026]">
            <tr>
              <th className="p-4 text-left">Name</th>

              <th className="p-4 text-left">Email</th>

              <th className="p-4 text-left">Role</th>

              <th className="p-4 text-left">Status</th>

              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}

                  className="border-t border-white/10"
                >
                  <td className="p-4">{user.name}</td>

                  <td className="p-4">{user.email}</td>

                  <td className="p-4">
                    <span className="rounded-full bg-blue-500/20 px-3 py-1">
                      {user.role}
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 ${
                        user.status === "ACTIVE"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      } `}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          router.push(`/admin/users/${user.id}/edit`)
                        }

                        className="rounded-lg bg-yellow-500 px-3 py-2 text-black"
                      >
                        Edit
                      </button>

                      <button
                        disabled={deleteLoading === user.id}

                        onClick={() => deleteUser(user.id)}

                        className="rounded-lg bg-red-600 px-3 py-2 disabled:opacity-50"
                      >
                        {deleteLoading === user.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
