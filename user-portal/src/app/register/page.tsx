"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

import api from "@/lib/api";
import authApi from "@/lib/authapi";
import {
  AuthBackdrop,
  AuthError,
  AuthLabel,
  AuthNotice,
  GoogleButtonSlot,
  GoogleDivider,
  MoonSpinner,
  authInputClass,
  FieldError,
} from "@/components/auth/AuthUi";

type Gender = "" | "MALE" | "FEMALE" | "OTHER" | "UNSPECIFIED";
type GoogleCredentialResponse = { credential: string };

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender: Gender;
  verificationCode: string;
};

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

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

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "",
    verificationCode: "",
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [welcomeTitle, setWelcomeTitle] = useState("");
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!welcomeTitle) return;
    const timer = window.setTimeout(() => { window.location.href = "/profile"; }, 1700);
    return () => window.clearTimeout(timer);
  }, [welcomeTitle]);

  function validateEmail(email: string) {
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
    if (!email.toLowerCase().endsWith("@gmail.com")) return "Only Gmail accounts are allowed";
    return "";
  }

  function validatePassword(password: string) {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password needs uppercase letter";
    if (!/[a-z]/.test(password)) return "Password needs lowercase letter";
    if (!/[0-9]/.test(password)) return "Password needs number";
    if (!/[!@#$%^&*]/.test(password)) return "Password needs special character";
    return "";
  }

  function validateAll() {
    const nextErrors: RegisterErrors = {};
    const name = form.name.trim();
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    if (!name) nextErrors.name = "Name is required";
    else if (name.length < 2) nextErrors.name = "Name must be at least 2 characters";
    if (emailError) nextErrors.email = emailError;
    if (!form.dateOfBirth) nextErrors.dateOfBirth = "Date of birth is required";
    if (!form.gender) nextErrors.gender = "Please choose a gender";
    if (passwordError) nextErrors.password = passwordError;
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match";
    if (!/^\d{6}$/.test(form.verificationCode)) nextErrors.verificationCode = "Enter the 6-digit code sent to Gmail";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleChange(field: keyof RegisterForm, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
    if (submitted) setErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  async function sendCode() {
    const emailError = validateEmail(form.email);
    if (emailError) {
      setErrors((previous) => ({ ...previous, email: emailError }));
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

  function initializeGoogle() {
    if (!googleClientId || !googleButtonRef.current || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      ux_mode: "popup",
      callback: async (response) => {
        try {
          setLoading(true);
          setServerError("");
          const result = await authApi.post("/api/user-portal/auth/google", {
            credential: response.credential,
          });
          if (result.data.isNewUser) {
            window.location.href = "/google-complete";
            return;
          }
          setWelcomeTitle("Welcome back");
        } catch (error: unknown) {
          setServerError(
            axios.isAxiosError(error)
              ? error.response?.data?.message ?? "Google signup failed"
              : "Google signup failed",
          );
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

  async function register() {
    setSubmitted(true);
    setServerError("");
    if (!validateAll()) return;

    try {
      setLoading(true);
      await api.post("/api/user-portal/auth/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        verificationCode: form.verificationCode,
      });
      await authApi.post("/api/user-portal/auth/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      setWelcomeTitle("Welcome");
    } catch (error: unknown) {
      setServerError(
        axios.isAxiosError(error)
          ? error.response?.data?.message ?? "Register failed"
          : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  const field = (key: keyof RegisterForm) => authInputClass(Boolean(errors[key]));

  return (
    <AuthBackdrop>
      {welcomeTitle ? (
        <AuthNotice
          title={welcomeTitle}
          message="Your Broadcast360 account is ready. Taking you to your account now."
          onDone={() => { window.location.href = "/profile"; }}
        />
      ) : null}

      <div className="mx-auto w-full max-w-[480px] rounded-[2rem] border border-blue-200/10 bg-[#16265b]/90 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-8">
        <div className="mb-7 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/70">Broadcast360</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Create Account</h1>
          <p className="mt-2 text-sm text-slate-300">Register your Broadcast360 account</p>
        </div>

        {serverError ? <AuthError message={serverError} /> : null}

        <div className="mt-6 space-y-4">
          <div>
            <AuthLabel>Name</AuthLabel>
            <input value={form.name} autoComplete="name" onChange={(event) => handleChange("name", event.target.value)} className={field("name")} />
            <FieldError message={errors.name} />
          </div>

          <div>
            <AuthLabel>Email</AuthLabel>
            <input type="email" value={form.email} placeholder="example@gmail.com" autoComplete="email" onChange={(event) => handleChange("email", event.target.value)} className={field("email")} />
            <FieldError message={errors.email} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <AuthLabel>Date of Birth</AuthLabel>
              <input type="date" value={form.dateOfBirth} onChange={(event) => handleChange("dateOfBirth", event.target.value)} className={field("dateOfBirth")} />
              <FieldError message={errors.dateOfBirth} />
            </div>
            <div>
              <AuthLabel>Gender</AuthLabel>
              <select value={form.gender} onChange={(event) => handleChange("gender", event.target.value)} className={`${field("gender")} appearance-none`}>
                <option value="" disabled>Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="UNSPECIFIED">Prefer not to say</option>
              </select>
              <FieldError message={errors.gender} />
            </div>
          </div>

          <div>
            <AuthLabel>Email verification code</AuthLabel>
            <div className="flex gap-2">
              <input value={form.verificationCode} inputMode="numeric" maxLength={6} placeholder="6-digit code" onChange={(event) => handleChange("verificationCode", event.target.value.replace(/\D/g, ""))} className={`${field("verificationCode")} min-w-0 flex-1`} />
              <button type="button" onClick={sendCode} disabled={codeLoading} className="rounded-2xl border border-cyan-200/30 px-3 text-xs font-bold text-cyan-100 transition hover:bg-cyan-200/10 disabled:opacity-60">
                {codeLoading ? <MoonSpinner label="Sending" /> : codeSent ? "Resend code" : "Send code"}
              </button>
            </div>
            <FieldError message={errors.verificationCode} />
          </div>

          <div>
            <AuthLabel>Password</AuthLabel>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={form.password} autoComplete="new-password" onChange={(event) => handleChange("password", event.target.value)} className={`${field("password")} pr-12`} />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            <FieldError message={errors.password} />
          </div>

          <div>
            <AuthLabel>Confirm Password</AuthLabel>
            <div className="relative">
              <input type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} autoComplete="new-password" onChange={(event) => handleChange("confirmPassword", event.target.value)} className={`${field("confirmPassword")} pr-12`} />
              <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            <FieldError message={errors.confirmPassword} />
          </div>

          <button type="button" onClick={register} disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-blue-500 via-blue-500 to-cyan-400 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-blue-950/30 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70">
            {loading ? <MoonSpinner label="Creating account" /> : "Create Account"}
          </button>
        </div>

        {googleClientId ? (
          <>
            <GoogleDivider />
            <GoogleButtonSlot googleButtonRef={googleButtonRef} />
            <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={initializeGoogle} />
          </>
        ) : null}

        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account?
          <Link href="/login" className="ml-1.5 font-semibold text-cyan-200 transition hover:text-white">Login</Link>
        </p>
      </div>
    </AuthBackdrop>
  );
}
