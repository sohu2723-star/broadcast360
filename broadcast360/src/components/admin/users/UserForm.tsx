"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "ADMIN" | "USER";

type Status = "ACTIVE" | "INACTIVE" | "BANNED";

interface UserFormData {
  name: string;

  email: string;

  password: string;

  role: Role;

  status: Status;
}

interface Props {
  mode: "create" | "edit";

  userId?: number;
}

export default function UserForm({ mode, userId }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [fetching, setFetching] = useState(mode === "edit");

  const [changePassword, setChangePassword] = useState(false);

  const [form, setForm] = useState<UserFormData>({
    name: "",

    email: "",

    password: "",

    role: "USER",

    status: "ACTIVE",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  /*
=====================
LOAD USER
=====================
*/

  useEffect(() => {
    if (mode === "edit" && userId) {
      loadUser();
    }
  }, []);

  async function loadUser() {
    try {
      const res = await fetch(`/api/users/${userId}`);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setForm({
        name: data.user.name,

        email: data.user.email,

        password: "",

        role: data.user.role,

        status: data.user.status,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  }

  /*
=====================
SUBMIT
=====================
*/

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    setErrors({});

    try {
      let body;

      if (mode === "edit") {
        body = {
          name: form.name,

          email: form.email,

          role: form.role,

          status: form.status,

          // only update password when requested

          ...(changePassword && form.password
            ? {
                password: form.password,
              }
            : {}),
        };
      } else {
        body = form;
      }

      const res = await fetch(
        mode === "create" ? "/api/users" : `/api/users/${userId}`,

        {
          method: mode === "create" ? "POST" : "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(body),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors ?? {});

        return;
      }

      router.push("/admin/users");

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return <div className="text-white">Loading user...</div>;
  }

  return (
    <form
      onSubmit={submit}

      className="space-y-5 rounded-xl bg-[#0B1026] p-6"
    >
      <h2 className="text-xl font-bold text-white">
        {mode === "create" ? "Create User" : "Edit User"}
      </h2>

      <input
        className="w-full rounded-lg bg-[#111936] p-3 text-white"

        placeholder="Name"

        value={form.name}

        onChange={(e) =>
          setForm({
            ...form,

            name: e.target.value,
          })
        }
      />

      <input
        className="w-full rounded-lg bg-[#111936] p-3 text-white"

        placeholder="Email"

        value={form.email}

        onChange={(e) =>
          setForm({
            ...form,

            email: e.target.value,
          })
        }
      />

      {/* PASSWORD */}

      {mode === "create" ? (
        <input
          type="password"

          className="w-full rounded-lg bg-[#111936] p-3 text-white"

          placeholder="Password"

          value={form.password}

          onChange={(e) =>
            setForm({
              ...form,

              password: e.target.value,
            })
          }
        />
      ) : (
        <div>
          <button
            type="button"

            onClick={() => {
              setChangePassword(!changePassword);

              setForm({
                ...form,

                password: "",
              });
            }}

        className="
mb-3
rounded-lg
border
border-white/20
bg-white/10
px-4
py-2
text-white
hover:bg-white/20
transition
"
        >
            {changePassword ? "Cancel Password Change" : "Change Password"}
          </button>

          {changePassword && (
            <input
              type="password"

              className="w-full rounded-lg bg-[#111936] p-3 text-white"

              placeholder="New Password"

              value={form.password}

              onChange={(e) =>
                setForm({
                  ...form,

                  password: e.target.value,
                })
              }
            />
          )}
        </div>
      )}

      <select
        className="w-full rounded-lg bg-[#111936] p-3 text-white"

        value={form.role}

        onChange={(e) =>
          setForm({
            ...form,

            role: e.target.value as Role,
          })
        }
      >
        <option value="USER">USER</option>

        <option value="ADMIN">ADMIN</option>
      </select>

      <select
        className="w-full rounded-lg bg-[#111936] p-3 text-white"

        value={form.status}

        onChange={(e) =>
          setForm({
            ...form,

            status: e.target.value as Status,
          })
        }
      >
        <option value="ACTIVE">ACTIVE</option>

        <option value="INACTIVE">INACTIVE</option>

        <option value="BANNED">BANNED</option>
      </select>

      <div className="flex gap-3">
        <button
          type="submit"

          disabled={loading}

          className="rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
          {loading ? "Saving..." : mode === "create" ? "Create" : "Update"}
        </button>

        <button
          type="button"

          onClick={() => router.back()}

          className="rounded-lg bg-gray-600 px-5 py-3 text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
