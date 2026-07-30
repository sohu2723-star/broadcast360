"use client";

import { useEffect, useState } from "react";
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

import type { User } from "@/types/user";

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
    <div className="max-w-5xl rounded-3xl border border-white/10 bg-[#111936] p-8 text-white">
      <div className="mb-10 flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>

          <p className="text-gray-400">Manage your account</p>
        </div>

        <button
          onClick={logout}
          className="rounded-xl bg-red-600 px-6 py-3 font-semibold"
        >
          Logout
        </button>
      </div>

      <div className="mb-8 flex items-center gap-6 rounded-2xl bg-white/5 p-6">
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-purple-600 text-4xl font-bold">
          {user?.avatar ? (
            <img src={user.avatar} className="h-full w-full object-cover" />
          ) : (
            user?.name.charAt(0)
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold">{user?.name}</h2>

          <p className="text-gray-400">{user?.email}</p>

          <span className="mt-3 inline-block rounded-full bg-blue-500/20 px-4 py-1 text-blue-300">
            {user?.role} 🔒
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Name" value={user?.name} />

        <InfoCard title="Email" value={user?.email} />

        <InfoCard title="Phone" value={user?.phone} />

        <InfoCard title="Role" value={user?.role} />
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={() => setEditOpen(true)}
          className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold"
        >
          Edit Profile
        </button>

        <button
          onClick={() => setPasswordOpen(true)}
          className="flex-1 rounded-xl bg-orange-500 py-3 font-semibold"
        >
          Change Password
        </button>
      </div>

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

