"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import InfoCard from "@/components/admin/profile/InfoCard";
import EditProfileModal from "@/components/admin/profile/EditProfileModal";
import ChangePasswordModal from "@/components/admin/profile/ChangePasswordModal";

import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
} from "@/lib/validators/profile.validator";
import { User } from "@/types/user";
import { clearGoogleAutoSelect } from "@/lib/google-session";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);

  const [passwordOpen, setPasswordOpen] = useState(false);

  // profile values

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");

  // avatar

  const [avatar, setAvatar] = useState("");

  const [avatarPreview, setAvatarPreview] = useState("");

  // profile errors

  const [profileErrors, setProfileErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // password

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/auth/me");

      const data = await res.json();

      if (!res.ok) {
        router.push("/login");

        return;
      }

      setUser(data.user);

      setName(data.user.name ?? "");

      setEmail(data.user.email ?? "");

      setPhone(data.user.phone ?? "");

      setAvatar(data.user.avatar ?? "");

      setAvatarPreview(data.user.avatar ?? "");

      setLoading(false);
    }

    load();
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    clearGoogleAutoSelect();
    router.push("/login");

    router.refresh();
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;

      setAvatar(result);

      setAvatarPreview(result);
    };

    reader.readAsDataURL(file);
  }

  async function saveProfile() {
    const errors = {
      name: validateName(name),

      email: validateEmail(email),

      phone: validatePhone(phone),
    };

    setProfileErrors(errors);

    if (errors.name || errors.email || errors.phone) {
      return;
    }

    setSaving(true);

    const res = await fetch("/api/auth/profile", {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name,

        email,

        phone,

        avatar,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setUser(data.user);

      setEditOpen(false);
    }

    setSaving(false);
  }

  async function changePassword() {
    const errors = {
      currentPassword: currentPassword ? "" : "Current password is required",

      newPassword: validatePassword(newPassword),

      confirmPassword: validateConfirmPassword(newPassword, confirmPassword),
    };

    setPasswordErrors(errors);

    if (
      errors.currentPassword ||
      errors.newPassword ||
      errors.confirmPassword
    ) {
      return;
    }

    const res = await fetch("/api/auth/change-password", {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        currentPassword,

        newPassword,
      }),
    });

    if (res.ok) {
      setPasswordOpen(false);

      setCurrentPassword("");

      setNewPassword("");

      setConfirmPassword("");
    }
  }

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 text-white">
      {/* Main Glass Card */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0B1026]/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              My Profile
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Manage your account credentials and personal information
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-2.5 text-sm font-semibold text-red-400 shadow-lg shadow-red-500/10 transition-all duration-200 hover:bg-red-500 hover:text-white"
          >
            Logout
          </button>
        </div>

        {/* Modern Hero Banner */}
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-950/40 via-slate-900/50 to-blue-950/40 p-8 shadow-inner">
          {/* Background Decorative Glow */}
          <div className="pointer-events-none absolute -top-12 -left-12 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
            {/* Circular Image Container with Halo Accent */}
            <div className="relative mb-4 shrink-0 sm:mb-0">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-indigo-500/50 bg-[#111936] shadow-xl ring-4 shadow-indigo-500/10 ring-white/5">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-black text-indigo-400">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                  </span>
                )}
              </div>
            </div>

            {/* User Details & Role below image */}
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <h2 className="text-2xl font-bold tracking-wide text-white">
                {user?.name}
              </h2>
              <p className="text-sm text-gray-400">{user?.email}</p>

              {/* Role Badge directly under image/info inside Hero */}
              <div className="mt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-xs font-semibold tracking-wider text-indigo-300 shadow-sm">
                  <span>{user?.role ?? "ADMIN"}</span>
                                    <ShieldCheck size={13} strokeWidth={1.8} aria-hidden="true" />

                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard title="Name" value={user?.name} />
          <InfoCard title="Email" value={user?.email} />
          <InfoCard title="Phone" value={user?.phone || "Not provided"} />
          <InfoCard title="Role" value={user?.role} />
        </div>

        {/* Actions Section */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <button
            onClick={() => setEditOpen(true)}
            className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-500 hover:to-indigo-500"
          >
            Edit Profile
          </button>

          <button
            onClick={() => setPasswordOpen(true)}
            className="flex-1 rounded-xl bg-[#400FD3] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#400FD3]/20 transition duration-200 hover:opacity-90"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Modals - Intact */}
      {editOpen && (
        <EditProfileModal
          name={name}
          email={email}
          phone={phone}
          avatarPreview={avatarPreview}
          saving={saving}
          errors={profileErrors}
          setName={setName}
          setEmail={setEmail}
          setPhone={setPhone}
          handleAvatarChange={handleAvatarChange}
          saveProfile={saveProfile}
          close={() => setEditOpen(false)}
        />
      )}

      {passwordOpen && (
        <ChangePasswordModal
          currentPassword={currentPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          showPassword={showPassword}
          errors={passwordErrors}
          setCurrentPassword={setCurrentPassword}
          setNewPassword={setNewPassword}
          setConfirmPassword={setConfirmPassword}
          setShowPassword={setShowPassword}
          changePassword={changePassword}
          close={() => setPasswordOpen(false)}
        />
      )}
    </div>
  );
}
