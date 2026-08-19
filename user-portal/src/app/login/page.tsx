"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import authApi from "@/lib/authapi";
import axios from "axios";

interface LoginForm {
  email: string;
  password: string;
}

interface Errors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Errors>({});

  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);

  const [serverError, setServerError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

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
      return "Password must contain at least 8 characters";
    }

    return "";
  }

  function validateAll() {
    const newErrors: Errors = {};

    const emailError = validateEmail(form.email);

    const passwordError = validatePassword(form.password);

    if (emailError) {
      newErrors.email = emailError;
    }

    if (passwordError) {
      newErrors.password = passwordError;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function handleChange(field: keyof LoginForm, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (!submitted) {
      return;
    }

    setErrors((prev) => ({
      ...prev,
      [field]:
        field === "email" ? validateEmail(value) : validatePassword(value),
    }));
  }

  async function login() {
    setSubmitted(true);

    setServerError("");

    if (!validateAll()) {
      return;
    }

    try {
      setLoading(true);

      const response = await authApi.post("/api/user-portal/auth/login", form);

      const data = response.data;

      if (data.user.role === "ADMIN") {
        setServerError("Admin accounts cannot login here");

        return;
      }

      window.location.href = "/profile";
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setServerError(error.response?.data?.message ?? "Login failed");
      } else {
        setServerError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  function inputClass(field: keyof LoginForm) {
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
        <h1 className="text-center text-3xl font-bold text-white">Login</h1>

        <p className="mb-8 mt-2 text-center text-gray-400">
          Welcome back to Broadcast360
        </p>

        {serverError && (
          <div className="mb-5 rounded-xl bg-red-500/10 p-3 text-center text-red-400">
            {serverError}
          </div>
        )}

        <div className="space-y-5">
          {/* EMAIL */}

          <div>
            <label className="mb-2 block text-sm text-gray-300">Email</label>

            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={`w-full rounded-xl border bg-[#0B1026] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/30 ${inputClass("email")}`}
            />

            {errors.email && (
              <p className="mt-2 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          {/* PASSWORD */}

          <div>
            <label className="mb-2 block text-sm text-gray-300">Password</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={`w-full rounded-xl border bg-[#0B1026] px-4 py-3 pr-12 text-white outline-none focus:ring-2 focus:ring-blue-500/30 ${inputClass("password")}`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {errors.password && (
              <p className="mt-2 text-sm text-red-400">{errors.password}</p>
            )}
          </div>

          <button
            onClick={login}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white transition hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          Do not have an account?
          <Link
            href="/register"
            className="ml-2 font-semibold text-blue-400 hover:text-blue-300"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
