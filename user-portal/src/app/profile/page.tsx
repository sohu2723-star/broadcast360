
"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Heart, LockKeyhole, LogOut, Pencil, Play, UserRound } from "lucide-react";
import { MoonSpinner } from "@/components/auth/AuthUi";
import axios from "axios";

import Avatar from "@/components/ui/Avatar";
import EditProfileModal from "@/components/profile/EditProfileModal";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";
import SubscriptionStatusCard from "@/components/profile/SubscriptionStatusCard";

import { useCurrentUser } from "@/lib/useCurrentUser";
import authApi from "@/lib/authapi";
import { clearGoogleAutoSelect } from "@/lib/google-session";

export default function ProfilePage() {
  const { user, loading } = useCurrentUser();

  /* =====================================================
     EDIT PROFILE
  ===================================================== */

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [avatar, setAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");

  const [profileErrors, setProfileErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});

  /* =====================================================
     CHANGE PASSWORD
  ===================================================== */

  const [passwordOpen, setPasswordOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  /* =====================================================
     OPEN EDIT PROFILE
  ===================================================== */

  function openEdit() {
    if (!user) return;

    setName(user.name ?? "");
    setEmail(user.email ?? "");
    setPhone(user.phone ?? "");

    setAvatar(user.avatar ?? "");
    setAvatarPreview(user.avatar ?? "");

    setProfileErrors({});
    setEditOpen(true);
  }

  /* =====================================================
     PROFILE VALIDATION
  ===================================================== */

  function validateProfile() {
    const errors: {
      name?: string;
      email?: string;
      phone?: string;
    } = {};

    if (!name.trim()) {
      errors.name = "Name is required";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email format";
    } else if (!email.toLowerCase().endsWith("@gmail.com")) {
      errors.email = "Only Gmail accounts allowed";
    }

    if (phone) {
      if (!/^09\d{7,9}$/.test(phone)) {
        errors.phone = "Invalid Myanmar phone format";
      }
    }

    setProfileErrors(errors);

    return Object.keys(errors).length === 0;
  }

  /* =====================================================
     PASSWORD VALIDATION
  ===================================================== */

  function validatePassword() {
    const errors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!currentPassword) {
      errors.currentPassword = "Current password required";
    }

    if (!newPassword) {
      errors.newPassword = "New password required";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Minimum 8 characters";
    } else if (!/[A-Z]/.test(newPassword)) {
      errors.newPassword = "Need uppercase letter";
    } else if (!/[a-z]/.test(newPassword)) {
      errors.newPassword = "Need lowercase letter";
    } else if (!/[0-9]/.test(newPassword)) {
      errors.newPassword = "Need number";
    } else if (!/[!@#$%^&*]/.test(newPassword)) {
      errors.newPassword = "Need special character";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Password does not match";
    }

    setPasswordErrors(errors);

    return Object.keys(errors).length === 0;
  }

  /* =====================================================
     AVATAR UPLOAD
  ===================================================== */

  function handleAvatarChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    /* Only images */
    if (!file.type.startsWith("image/")) {
      console.error("Please select an image file.");
      e.target.value = "";
      return;
    }

    /* Maximum 2 MB */
    if (file.size > 2 * 1024 * 1024) {
      console.error("Image must be smaller than 2 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        console.error("Invalid image data.");
        return;
      }

      /*
       * Store Base64 string.
       *
       * avatar       -> sent to backend
       * avatarPreview -> displayed immediately
       */
      setAvatar(reader.result);
      setAvatarPreview(reader.result);
    };

    reader.onerror = () => {
      console.error("Failed to read avatar.");
    };

    reader.readAsDataURL(file);

    /*
     * Allows selecting the same image again.
     */
    e.target.value = "";
  }

  /* =====================================================
     SAVE PROFILE
  ===================================================== */

  async function saveProfile() {
    if (!validateProfile()) {
      return;
    }

    try {
      setSaving(true);

      await authApi.put(
        "/api/user-portal/auth/profile",
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          avatar,
        }
      );

      setEditOpen(false);

      /*
       * Reload so:
       * - useCurrentUser gets new avatar
       * - Navbar gets new avatar
       * - Profile page gets new avatar
       */
      window.location.reload();
    } catch (error: unknown) {
      console.error("Profile update failed:", error);

      if (axios.isAxiosError(error)) {
        console.error(
          "Server response:",
          error.response?.data
        );
      }
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     CHANGE PASSWORD
  ===================================================== */

  async function changePassword() {
    if (!validatePassword()) {
      return;
    }

    try {
      await authApi.put(
        "/api/user-portal/auth/change-password",
        {
          currentPassword,
          newPassword,
        }
      );

      await authApi.post("/api/user-portal/auth/logout");
      clearGoogleAutoSelect();

      alert("Password updated successfully. Please login again.");

      window.location.href = "/login";
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setPasswordErrors({
          currentPassword:
            error.response?.data?.message ??
            "Password update failed",
        });
      } else {
        setPasswordErrors({
          currentPassword:
            "Password update failed",
        });
      }
    }
  }

  /* =====================================================
     LOGOUT
  ===================================================== */

  async function logout() {
    try {
      await authApi.post(
        "/api/user-portal/auth/logout"
      );

      clearGoogleAutoSelect();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#010312]">
        <div className="rounded-3xl border border-white/10 bg-[#0d142c] px-6 py-5 text-sm text-zinc-300 shadow-xl">
          <MoonSpinner label="Loading your account" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#010312] px-5 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d142c] p-7 text-center shadow-2xl">
          <h1 className="text-2xl font-bold">Your session has expired</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Please sign in again to open your Hxu Movie account.</p>
          <Link href="/login" className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110">Sign in again</Link>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#010312] text-white">

      {/* BACKGROUND GLOW */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8">

        {/* HEADER */}

        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
            Account
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Manage your account and continue watching your favorite content.
          </p>
        </div>

        {/* PROFILE HERO */}

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d142c]">

          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />

          <div className="relative p-6 sm:p-8">

            <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">

              {/* USER */}

              <div className="flex items-center gap-5">

                {/* =================================================
                    AVATAR
                    USE THE SAME COMPONENT AS NAVBAR
                ================================================= */}

                <div className="relative shrink-0">

                  <div className="rounded-full border-4 border-[#111936] bg-[#111936] shadow-xl shadow-blue-900/20">

                    <Avatar
                      name={user.name}
                      avatar={user.avatar ?? undefined}
                      size={112}
                    />

                  </div>

                  {/* ONLINE */}

                  <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-[#0d142c] bg-emerald-500" />

                </div>

                {/* DETAILS */}

                <div className="min-w-0">

                  <h2 className="truncate text-2xl font-bold text-white sm:text-3xl">
                    {user.name}
                  </h2>

                  <p className="mt-1 truncate text-sm text-zinc-400">
                    {user.email}
                  </p>

                  {user.phone && (
                    <p className="mt-1 text-sm text-zinc-500">
                      {user.phone}
                    </p>
                  )}

                  <div className="mt-3 inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                    Active account
                  </div>

                </div>

              </div>

              {/* EDIT */}

              <button
                type="button"
                onClick={openEdit}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-blue-900/20
                  transition
                  hover:bg-blue-500
                  active:scale-[0.98]
                "
              >
                <Pencil size={16} strokeWidth={1.8} aria-hidden="true" />
                Edit Profile
              </button>

            </div>

          </div>
        </section>

        {/* SUBSCRIPTION */}

        <div className="mt-6">
          <SubscriptionStatusCard user={user} />
        </div>

        {/* QUICK ACTIONS */}

        <section className="mt-6 grid gap-5 md:grid-cols-2">

          {/* WATCH HISTORY */}

          <Link
            href="/profile/history"
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-white/10
              bg-[#0d142c]
              p-6
              transition
              duration-300
              hover:-translate-y-1
              hover:border-blue-500/40
            "
          >

            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-600/10 blur-2xl transition group-hover:bg-blue-600/20" />

            <div className="relative">

              <div className="mb-5 flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-200">
                  <Play size={22} strokeWidth={1.8} aria-hidden="true" />
                </div>

                <ArrowRight size={18} className="text-zinc-500 transition group-hover:translate-x-1 group-hover:text-blue-400" aria-hidden="true" />

              </div>

              <h3 className="text-xl font-bold text-white">
                Watch History
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Continue watching movies, episodes, entertainment and news you have started.
              </p>

              <div className="mt-5 text-sm font-semibold text-blue-400">
                <span className="inline-flex items-center gap-1.5">View watch history <ArrowRight size={15} aria-hidden="true" /></span>
              </div>

            </div>
          </Link>

          {/* FAVORITES */}

          <Link
            href="/profile/favorites"
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-white/10
              bg-[#0d142c]
              p-6
              transition
              duration-300
              hover:-translate-y-1
              hover:border-purple-500/40
            "
          >

            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-600/10 blur-2xl" />

            <div className="relative">

              <div className="mb-5 flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-200">
                  <Heart size={22} strokeWidth={1.8} aria-hidden="true" />
                </div>

                <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-purple-400">
                  <span className="inline-flex items-center gap-1.5">View Favorites <ArrowRight size={13} aria-hidden="true" /></span>
                </span>

              </div>

              <h3 className="text-xl font-bold text-white">
                Favorites
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Save movies, news and shows you want to watch later.
              </p>

              <div className="mt-5 text-sm font-semibold text-purple-400">
                Save your favorite videos
              </div>

            </div>
          </Link>

        </section>

        {/* ACCOUNT SETTINGS */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0d142c]">

          <div className="border-b border-white/10 px-6 py-5">

            <h2 className="text-lg font-bold text-white">
              Account Settings
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Manage your security and account access.
            </p>

          </div>

          {/* PASSWORD */}

          <button
            type="button"
            onClick={() => {
              setPasswordErrors({});
              setPasswordOpen(true);
            }}
            className="
              flex
              w-full
              items-center
              justify-between
              border-b
              border-white/10
              px-6
              py-5
              text-left
              transition
              hover:bg-white/[0.03]
            "
          >

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-200">
                <LockKeyhole size={20} strokeWidth={1.8} aria-hidden="true" />
              </div>

              <div>

                <p className="font-semibold text-white">
                  Password
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Update your account password
                </p>

              </div>

            </div>

            <ArrowRight size={18} className="text-zinc-500" aria-hidden="true" />

          </button>

          {/* PROFILE */}

          <button
            type="button"
            onClick={openEdit}
            className="
              flex
              w-full
              items-center
              justify-between
              border-b
              border-white/10
              px-6
              py-5
              text-left
              transition
              hover:bg-white/[0.03]
            "
          >

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-200">
                <UserRound size={20} strokeWidth={1.8} aria-hidden="true" />
              </div>

              <div>

                <p className="font-semibold text-white">
                  Personal Information
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Update your name, email, phone and avatar
                </p>

              </div>

            </div>

            <ArrowRight size={18} className="text-zinc-500" aria-hidden="true" />

          </button>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={logout}
            className="
              flex
              w-full
              items-center
              justify-between
              px-6
              py-5
              text-left
              transition
              hover:bg-red-500/[0.04]
            "
          >

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-200">
                <LogOut size={20} strokeWidth={1.8} aria-hidden="true" />
              </div>

              <div>

                <p className="font-semibold text-red-400">
                  Sign Out
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Sign out of your Hxu Movie account
                </p>

              </div>

            </div>

            <ArrowRight size={18} className="text-zinc-500" aria-hidden="true" />

          </button>

        </section>

        {/* FOOTER */}

        <div className="mt-8 text-center">

          <p className="text-xs text-zinc-600">
            Hxu Movie
          </p>

          <p className="mt-1 text-[11px] text-zinc-700">
            Your personal streaming experience
          </p>

        </div>

      </main>

      {/* =====================================================
          EDIT PROFILE MODAL
      ===================================================== */}

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

      {/* =====================================================
          CHANGE PASSWORD MODAL
      ===================================================== */}

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
          close={() => {
            setPasswordOpen(false);
            setPasswordErrors({});
          }}
        />
      )}

    </div>
  );
}
