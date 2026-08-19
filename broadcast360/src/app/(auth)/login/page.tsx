"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  AuthBackdrop,
  AuthError,
  AuthLabel,
  AuthNotice,
  FieldError,
  GoogleButtonSlot,
  GoogleDivider,
  MoonSpinner,
  authInputClass,
} from "@/components/auth/AuthUi";

type GoogleCredentialResponse = { credential: string };

type LoginForm = { email: string; password: string };
type LoginErrors = { email?: string; password?: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            ux_mode?: "popup" | "redirect";
            auto_select?: boolean;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!showWelcomeBack) return;
    const timer = window.setTimeout(() => router.push("/admin"), 1700);
    return () => window.clearTimeout(timer);
  }, [router, showWelcomeBack]);

  function validateEmail(email: string) {
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
    if (!email.toLowerCase().endsWith("@gmail.com")) return "Only Gmail accounts are allowed";
    return "";
  }

  function validatePassword(password: string) {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must contain at least 8 characters";
    return "";
  }

  function validateAll() {
    const nextErrors: LoginErrors = {};
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    if (emailError) nextErrors.email = emailError;
    if (passwordError) nextErrors.password = passwordError;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function updateField(field: keyof LoginForm, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
    if (submitted) {
      setErrors((previous) => ({
        ...previous,
        [field]: field === "email" ? validateEmail(value) : validatePassword(value),
      }));
    }
  }

  function initializeGoogle() {
    if (!googleClientId || !googleButtonRef.current || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      ux_mode: "popup",
      auto_select: false,
      callback: async (response) => {
        try {
          setLoading(true);
          setServerError("");
          const result = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ credential: response.credential }),
          });
          const data = await result.json();
          if (!result.ok) {
            setServerError(data.message ?? "Google admin login failed");
            return;
          }
          setShowWelcomeBack(true);
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
      text: "continue_with",
      shape: "pill",
      width: 360,
    });
  }

  async function login() {
    setSubmitted(true);
    setServerError("");
    if (!validateAll()) return;

    try {
      setLoading(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setServerError(data.message ?? "Login failed");
        return;
      }
      if (data.user?.role !== "ADMIN") {
        setServerError("This account is not authorized for the admin portal");
        return;
      }
      setShowWelcomeBack(true);
    } catch {
      setServerError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthBackdrop>
      {showWelcomeBack ? (
        <AuthNotice
          title="Welcome back"
          message="Your Broadcast360 admin account is ready. Taking you to the dashboard now."
          onDone={() => router.push("/admin")}
        />
      ) : null}

      <div className="mx-auto w-full max-w-[440px] rounded-[2rem] border border-blue-200/10 bg-[#16265b]/90 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-8">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/70">Broadcast360 Admin</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Login</h1>
          <p className="mt-2 text-sm text-slate-300">Welcome back to Broadcast360</p>
        </div>

        {serverError ? <AuthError message={serverError} /> : null}

        <div className="mt-6 space-y-5">
          <div>
            <AuthLabel>Email</AuthLabel>
            <input
              type="email"
              value={form.email}
              placeholder="example@gmail.com"
              autoComplete="email"
              onChange={(event) => updateField("email", event.target.value)}
              className={authInputClass(Boolean(errors.email))}
            />
            <FieldError message={errors.email} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <AuthLabel>Password</AuthLabel>
              <button
                type="button"
                onClick={() => setServerError("Please contact the system administrator to reset the admin password.")}
                className="text-xs font-semibold text-cyan-200 transition hover:text-white"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                autoComplete="current-password"
                onChange={(event) => updateField("password", event.target.value)}
                className={`${authInputClass(Boolean(errors.password))} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            <FieldError message={errors.password} />
          </div>

          <button
            type="button"
            onClick={login}
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-500 via-blue-500 to-cyan-400 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-blue-950/30 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? <MoonSpinner label="Authenticating" /> : "Login"}
          </button>
        </div>

        {googleClientId ? (
          <>
            <GoogleDivider />
            <GoogleButtonSlot googleButtonRef={googleButtonRef} />
            <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={initializeGoogle} />
          </>
        ) : null}
      </div>
    </AuthBackdrop>
  );
}
