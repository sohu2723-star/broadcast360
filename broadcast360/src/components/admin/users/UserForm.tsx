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
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (mode === "edit" && userId) {
      loadUser();
    }
  }, []);

  async function loadUser() {
    try {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

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
  CLIENT-SIDE FIELD VALIDATORS (For On-Blur)
  =====================
  */
  const validateField = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2)
          return "Name must be at least 2 characters";
        return "";

      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email format";
        if (!value.toLowerCase().endsWith("@gmail.com"))
          return "Only Gmail accounts (@gmail.com) are allowed";
        return "";

      case "password":
        // Skip validation if editing and not changing password
        if (mode === "edit" && !changePassword) return "";
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/[A-Z]/.test(value)) return "Password needs an uppercase letter";
        if (!/[a-z]/.test(value)) return "Password needs a lowercase letter";
        if (!/[0-9]/.test(value)) return "Password needs a number";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
          return "Password needs a special character";
        return "";

      default:
        return "";
    }
  };

  /*
  =====================
  ON BLUR HANDLER
  =====================
  */
  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    const value = form[fieldName as keyof UserFormData] as string;
    const errorMsg = validateField(fieldName, value);

    setErrors((prev) => ({
      ...prev,
      [fieldName]: errorMsg,
    }));
  };

  /*
  =====================
  SUBMIT WITH ZOD & ON-BLUR FALLBACKS
  =====================
  */
  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // Mark all fields as touched to trigger full validation view
    setTouched({ name: true, email: true, password: true });

    // Pre-validate client side before hitting backend
    const nameErr = validateField("name", form.name);
    const emailErr = validateField("email", form.email);
    const passErr = validateField("password", form.password);

    if (nameErr || emailErr || passErr) {
      setErrors({
        name: nameErr,
        email: emailErr,
        password: passErr,
      });
      return;
    }

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
          ...(changePassword && form.password
            ? { password: form.password }
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
        if (data.errors && data.errors.fieldErrors) {
          const fieldErrors: Record<string, string> = {};
          Object.entries(data.errors.fieldErrors).forEach(([key, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              fieldErrors[key] = messages[0];
            }
          });
          setErrors(fieldErrors);
        } else if (data.message) {
          setErrors({ general: data.message });
        }
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
    return (
      <div className="flex h-64 items-center justify-center text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#106EE9] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <form
        onSubmit={submit}
        className="overflow-hidden rounded-3xl border border-white/10 bg-[#0B1026] p-8 shadow-2xl backdrop-blur-xl"
      >
        {/* Header */}
        <div className="mb-8 border-b border-white/10 pb-5">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {mode === "create" ? "Create New User" : "Edit User Account"}
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {mode === "create"
              ? "Fill in the information below to create a new user."
              : "Update user profile details and permissions."}
          </p>
        </div>

        {/* General Error Banner */}
        {errors.general && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {errors.general}
          </div>
        )}

        <div className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Full Name
            </label>
            <input
              className={`w-full rounded-xl border bg-[#111936] p-3.5 text-sm text-white placeholder-gray-500 transition focus:outline-none ${
                touched.name && errors.name
                  ? "border-red-500/60 focus:border-red-500"
                  : "border-white/10 focus:border-[#106EE9]"
              }`}
              placeholder="e.g. John Doe"
              value={form.name}
              onBlur={() => handleBlur("name")}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (touched.name) {
                  setErrors((prev) => ({
                    ...prev,
                    name: validateField("name", e.target.value),
                  }));
                }
              }}
            />
            {touched.name && errors.name && (
              <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Email Address{" "}
              <span className="text-gray-500">(Gmail required)</span>
            </label>
            <input
              type="email"
              className={`w-full rounded-xl border bg-[#111936] p-3.5 text-sm text-white placeholder-gray-500 transition focus:outline-none ${
                touched.email && errors.email
                  ? "border-red-500/60 focus:border-red-500"
                  : "border-white/10 focus:border-[#106EE9]"
              }`}
              placeholder="e.g. user@gmail.com"
              value={form.email}
              onBlur={() => handleBlur("email")}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                if (touched.email) {
                  setErrors((prev) => ({
                    ...prev,
                    email: validateField("email", e.target.value),
                  }));
                }
              }}
            />
            {touched.email && errors.email ? (
              <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
            ) : (
              <p className="mt-1 text-[11px] text-gray-500">
                Must end with @gmail.com
              </p>
            )}
          </div>

          {/* Password Field */}
          {mode === "create" ? (
            <div>
              <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                Password
              </label>
              <input
                type="password"
                className={`w-full rounded-xl border bg-[#111936] p-3.5 text-sm text-white placeholder-gray-500 transition focus:outline-none ${
                  touched.password && errors.password
                    ? "border-red-500/60 focus:border-red-500"
                    : "border-white/10 focus:border-[#106EE9]"
                }`}
                placeholder="e.g. Password123!"
                value={form.password}
                onBlur={() => handleBlur("password")}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (touched.password) {
                    setErrors((prev) => ({
                      ...prev,
                      password: validateField("password", e.target.value),
                    }));
                  }
                }}
              />
              {touched.password && errors.password ? (
                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
              ) : (
                <p className="mt-1 text-[11px] text-gray-500">
                  Min 8 chars, 1 uppercase, 1 lowercase, 1 number & 1 special
                  character (!@#$%^&*)
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-semibold text-white">
                    Password
                  </span>
                  <span className="text-xs text-gray-400">
                    Leave blank unless you wish to change it.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setChangePassword(!changePassword);
                    setForm({ ...form, password: "" });
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  className={`rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                    changePassword
                      ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {changePassword ? "Cancel Change" : "Change Password"}
                </button>
              </div>

              {changePassword && (
                <div className="mt-4 border-t border-white/5 pt-4">
                  <input
                    type="password"
                    className="w-full rounded-xl border border-white/10 bg-[#111936] p-3.5 text-sm text-white placeholder-gray-500 focus:border-[#106EE9] focus:outline-none"
                    placeholder="Enter new password"
                    value={form.password}
                    onBlur={() => handleBlur("password")}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value });
                      if (touched.password) {
                        setErrors((prev) => ({
                          ...prev,
                          password: validateField("password", e.target.value),
                        }));
                      }
                    }}
                  />
                  {touched.password && errors.password && (
                    <p className="mt-1.5 text-xs text-red-400">
                      {errors.password}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Role & Status Row */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                User Role
              </label>
              <select
                className="w-full cursor-pointer rounded-xl border border-white/10 bg-[#111936] p-3.5 text-sm text-white transition focus:border-[#106EE9] focus:outline-none"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as Role })
                }
              >
                <option value="USER" className="bg-[#0B1026]">
                  USER
                </option>
                <option value="ADMIN" className="bg-[#0B1026]">
                  ADMIN
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                Account Status
              </label>
              <select
                className="w-full cursor-pointer rounded-xl border border-white/10 bg-[#111936] p-3.5 text-sm text-white transition focus:border-[#106EE9] focus:outline-none"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as Status })
                }
              >
                <option value="ACTIVE" className="bg-[#0B1026]">
                  ACTIVE
                </option>
                <option value="INACTIVE" className="bg-[#0B1026]">
                  INACTIVE
                </option>
                <option value="BANNED" className="bg-[#0B1026]">
                  BANNED
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex gap-4 border-t border-white/10 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-[#106EE9] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#106EE9]/20 transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </span>
            ) : mode === "create" ? (
              "Create User"
            ) : (
              "Save Changes"
            )}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
