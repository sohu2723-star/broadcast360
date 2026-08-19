"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

import api from "@/lib/api";

interface RegisterForm {
  name: string;
  email: string;
    password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "UNSPECIFIED";
  verificationCode: string;

}

interface Errors {
  name?: string;
  email?: string;
  password?: string;
    confirmPassword?: string;
  verificationCode?: string;

}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "UNSPECIFIED",
    verificationCode: "",
  });

  const [errors, setErrors] = useState<Errors>({});

  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);

  const [serverError, setServerError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);

  function validateName(name: string) {

    if (!name.trim()) {
      return "Name is required";
    }

    if (name.trim().length < 3) {
      return "Name must be at least 3 characters";
    }

    return "";
  }

  function validateEmail(email: string) {
    if (!email.trim()) {
      return "Email is required";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Invalid email format";
    }

    if (!email.toLowerCase().endsWith("@gmail.com")) {
      return "Only Gmail accounts are allowed";
    }

    return "";
  }

  function validatePassword(password: string) {
    if (!password) {
      return "Password is required";
    }

    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password needs uppercase letter";
    }

    if (!/[a-z]/.test(password)) {
      return "Password needs lowercase letter";
    }

    if (!/[0-9]/.test(password)) {
      return "Password needs number";
    }

    if (!/[!@#$%^&*]/.test(password)) {
      return "Password needs special character";
    }

    return "";
  }

  function validateAll() {
    const newErrors: Errors = {};

    const nameError = validateName(form.name);
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);

    if (nameError) {
      newErrors.name = nameError;
    }

    if (emailError) {
      newErrors.email = emailError;
    }

    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!/^\d{6}$/.test(form.verificationCode)) {
      newErrors.verificationCode = "Enter the 6-digit code sent to Gmail";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function handleChange(field: keyof RegisterForm, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (submitted) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  }

    async function sendCode() {
    const emailError = validateEmail(form.email);
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      return;
    }
    try {
      setCodeLoading(true);
      setServerError("");
      await api.post("/api/user-portal/auth/send-code", { email: form.email });
      setCodeSent(true);
    } catch (error: unknown) {
      setServerError(
        axios.isAxiosError(error)
          ? error.response?.data?.message ?? "Could not send verification code"
          : "Could not send verification code",
      );
    } finally {
      setCodeLoading(false);
    }
  }

  async function register() {

    setSubmitted(true);

    setServerError("");

    if (!validateAll()) {
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/user-portal/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender,
        verificationCode: form.verificationCode,
      });

      router.push("/login");

      router.refresh();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setServerError(error.response?.data?.message ?? "Register failed");
      } else {
        setServerError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  function inputClass(field: keyof Errors) {
    if (!submitted) {
      return "border-white/10";
    }

    if (errors[field]) {
      return "border-red-500";
    }

    return "border-green-500";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#010312] px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111936] p-8 shadow-2xl">
        <h1 className="text-center text-3xl font-bold text-white">
          Create Account
        </h1>

        <p className="mb-8 mt-2 text-center text-gray-400">Join Broadcast360</p>

        {serverError && (
          <div className="mb-5 rounded-xl bg-red-500/10 p-3 text-center text-red-400">
            {serverError}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(v) => handleChange("name", v)}
            error={errors.name}
            className={inputClass("name")}
          />

                    <Input
            label="Email"
            value={form.email}
            onChange={(v) => handleChange("email", v)}
            error={errors.email}
            className={inputClass("email")}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={(v) => handleChange("dateOfBirth", v)}
              className="border-white/10"
            />
            <div>
              <label className="mb-2 block text-sm text-gray-300">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0B1026] px-4 py-3 text-white outline-none"
              >
                <option value="UNSPECIFIED">Prefer not to say</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">Email verification code</label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={form.verificationCode}
                onChange={(e) => handleChange("verificationCode", e.target.value.replace(/\D/g, ""))}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0B1026] px-4 py-3 text-white outline-none"
                placeholder="6-digit code"
              />
              <button
                type="button"
                onClick={sendCode}
                disabled={codeLoading}
                className="rounded-xl border border-blue-400/40 px-4 py-3 text-sm font-semibold text-blue-300 disabled:opacity-50"
              >
                {codeLoading ? "Sending..." : codeSent ? "Resend" : "Send code"}
              </button>
            </div>
            {errors.verificationCode && <p className="mt-1 text-sm text-red-400">{errors.verificationCode}</p>}
          </div>

          <div>

            <label className="mb-2 block text-sm text-gray-300">Password</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={`w-full rounded-xl border bg-[#0B1026] px-4 py-3 pr-12 text-white outline-none ${inputClass(
                  "password",
                )}`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password}</p>
            )}
          </div>
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(v) => handleChange("confirmPassword", v)}
            error={errors.confirmPassword}
            className={inputClass("confirmPassword")}
          />

          <button
            onClick={register}
            disabled={loading}
            className="mt-3 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account?
          <Link href="/login" className="ml-2 font-semibold text-blue-400">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  error,
  className,
  type = "text",
}: {
  label: string;

  value: string;

  onChange: (value: string) => void;

  error?: string;

  className: string;

  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-gray-300">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border bg-[#0B1026] px-4 py-3 text-white outline-none ${className}`}
      />

      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
