"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import axios from "axios";

import ProfileCard from "@/components/profile/ProfileCard";
import EditProfileModal from "@/components/profile/EditProfileModal";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";

import { useCurrentUser } from "@/lib/useCurrentUser";
import authApi from "@/lib/authapi";

export default function ProfilePage() {
  const router = useRouter();

  const { user, loading } = useCurrentUser();

  /*
  ======================
      EDIT PROFILE
  ======================
  */

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

  /*
  ======================
      CHANGE PASSWORD
  ======================
  */

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

  /*
  ======================
      OPEN EDIT
  ======================
  */

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

  /*
  ======================
      PROFILE VALIDATION
  ======================
  */

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
    } else if (!email.endsWith("@gmail.com")) {
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

  /*
  ======================
      PASSWORD VALIDATION
  ======================
  */

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

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Password does not match";
    }

    setPasswordErrors(errors);

    return Object.keys(errors).length === 0;
  }

  /*
  ======================
      AVATAR UPLOAD
  ======================
  */

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

  /*
  ======================
      SAVE PROFILE
  ======================
  */

  async function saveProfile() {
    if (!validateProfile()) return;

    try {
      setSaving(true);

      await authApi.put("/api/user-portal/auth/profile", {
        name,
        email,
        avatar,
        phone
      });

      setEditOpen(false);

      window.location.reload();
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setSaving(false);
    }
  }

  /*
  ======================
      CHANGE PASSWORD
  ======================
  */

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


    await authApi.post(
      "/api/user-portal/auth/logout"
    );


    alert(
      "Password updated successfully. Please login again."
    );


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

  /*
  ======================
      LOGOUT
  ======================
  */

  async function logout() {
    try {
      await authApi.post("/api/user-portal/auth/logout");

      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  if (loading) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div
      className="
      min-h-screen
      bg-[#010312]
      p-8
    "
    >
      <div
        className="
        mx-auto
        max-w-5xl
        rounded-3xl
        border
        border-white/10
        bg-[#111936]
        p-8
      "
      >
        <div
          className="
          mb-8
          flex
          justify-between
          items-center
        "
        >
          <h1
            className="
            text-3xl
            font-bold
            text-white
          "
          >
            My Profile
          </h1>

          <button
            onClick={logout}
            className="
              rounded-xl
              bg-red-600
              px-5
              py-3
              text-white
              font-semibold
            "
          >
            Logout
          </button>
        </div>

        <ProfileCard user={user} />

        <div
          className="
          mt-8
          flex
          gap-4
        "
        >
          <button
            onClick={openEdit}
            className="
              flex-1
              rounded-xl
              bg-blue-600
              py-3
              font-semibold
              text-white
            "
          >
            Edit Profile
          </button>

          <button
            onClick={() => setPasswordOpen(true)}
            className="
              flex-1
              rounded-xl
              bg-gradient-to-r
              from-yellow-500
              to-orange-500
              py-3
              font-semibold
              text-white
            "
          >
            Change Password
          </button>
        </div>
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
          close={() => {
            setPasswordOpen(false);

            setPasswordErrors({});
          }}
        />
      )}
    </div>
  );
}
