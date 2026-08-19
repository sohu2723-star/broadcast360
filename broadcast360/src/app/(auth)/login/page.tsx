"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type GoogleCredentialResponse = { credential: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            ux_mode?: "popup" | "redirect";
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

type LoginForm = {
  email: string;
  password: string;
};

type Errors = {
  email?: string;
  password?: string;
};

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
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  function initializeGoogle() {
    if (!googleClientId || !googleButtonRef.current || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      ux_mode: "popup",
      callback: async (response) => {
        try {
          setLoading(true);
          setServerError("");
          const googleResponse = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: response.credential }),
          });
          const data = await googleResponse.json();
          if (!googleResponse.ok) {
            setServerError(data.message ?? "Google admin login failed");
            return;
          }
          router.push("/admin");
        } catch {
          setServerError("Google admin login failed");
        } finally {
          setLoading(false);
        }
      },
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "pill",
      width: 360,
    });
  }

  function validateEmail(email: string) {
    if (!email.trim()) {
      return "Email is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Invalid email format.";
    }

    if (!email.toLowerCase().endsWith("@gmail.com")) {
      return "Only Gmail accounts are allowed.";
    }

    return "";
  }

  function validatePassword(password: string) {
    if (!password) {
      return "Password is required.";
    }

    if (password.length < 8) {
      return "Password must be at least 8 characters.";
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
    const updated = {
      ...form,
      [field]: value,
    };

    setForm(updated);

    if (!submitted) {
      return;
    }

    setErrors((prev) => ({
      ...prev,
      [field]:
        field === "email"
          ? validateEmail(value)
          : validatePassword(value),
    }));
  }

  function handleBlur(field: keyof LoginForm) {
    if (!submitted) {
      return;
    }

    setErrors((prev) => ({
      ...prev,
      [field]:
        field === "email"
          ? validateEmail(form.email)
          : validatePassword(form.password),
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

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message ?? "Login failed");
        return;
      }

      if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      setServerError("Something went wrong");
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
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111936] p-8 shadow-xl">
        <h1 className="text-center text-3xl font-bold text-white">Login</h1>
        <p className="mb-8 mt-2 text-center text-gray-400">
          Welcome back to Broadcast360
        </p>

        {serverError && (
          <div className="mb-5 rounded-lg bg-red-500/10 p-3 text-center text-red-400">
            {serverError}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-gray-300">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              className={`w-full rounded-xl border bg-[#0B1026] px-4 py-3 text-white outline-none ${inputClass("email")}`}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              className={`w-full rounded-xl border bg-[#0B1026] px-4 py-3 text-white outline-none ${inputClass("password")}`}
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-400">{errors.password}</p>
            )}
          </div>

          <button
            onClick={login}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        {googleClientId && (
          <>
            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gray-500">
              <span className="h-px flex-1 bg-white/10" />
              <span>or</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <div ref={googleButtonRef} className="flex justify-center" />
            <Script
              src="https://accounts.google.com/gsi/client"
              strategy="afterInteractive"
              onLoad={initializeGoogle}
            />
          </>
        )}

        {/* <p className="mt-8 text-center text-sm text-gray-400">
          {"Don't have an account? "}
          <Link
            href="/register"
            className="font-semibold text-blue-400 hover:text-blue-300"
          >
            Register
          </Link>
        </p> */}
      </div>
    </div>
  );
}