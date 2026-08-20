"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

import api from "@/lib/api";
import authApi from "@/lib/authapi";
import { clearCurrentUserCache } from "@/lib/current-user";
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

type GoogleCredentialResponse = { credential: string };

type LoginForm = { email: string; password: string };
type LoginErrors = { email?: string; password?: string };
type ForgotForm = { email: string; verificationCode: string; newPassword: string; confirmPassword: string };
type ForgotErrors = Partial<Record<keyof ForgotForm, string>>;

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
            use_fedcm_for_button?: boolean;
            button_auto_select?: boolean;
          }) => void;
                      renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
            prompt: () => void;

        };
      };
    };
  }
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotForm, setForgotForm] = useState<ForgotForm>({ email: "", verificationCode: "", newPassword: "", confirmPassword: "" });
  const [forgotErrors, setForgotErrors] = useState<ForgotErrors>({});
  const [forgotServerError, setForgotServerError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotCodeSent, setForgotCodeSent] = useState(false);
  const [showForgotCodeNotice, setShowForgotCodeNotice] = useState(false);
  const [forgotCountdown, setForgotCountdown] = useState(0);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleInitializedRef = useRef(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!showWelcomeBack) return;
    const timer = window.setTimeout(() => { window.location.href = "/profile"; }, 1700);
    return () => window.clearTimeout(timer);
  }, [showWelcomeBack]);

  useEffect(() => {
    if (forgotCountdown <= 0) return;
    const timer = window.setInterval(() => setForgotCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [forgotCountdown]);

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

  function handleChange(field: keyof LoginForm, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => {
      const next = { ...previous };
      const message = field === "email" ? validateEmail(value) : validatePassword(value);
      if (!message && next[field]) delete next[field];
      else if (submitted && message) next[field] = message;
      return next;
    });
    if (serverError) setServerError("");
  }

  function updateForgot(field: keyof ForgotForm, value: string) {
    setForgotForm((previous) => ({ ...previous, [field]: value }));
    setForgotErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
    if (forgotServerError) setForgotServerError("");
    if (field === "email") {
      setForgotCodeSent(false);
      setForgotCountdown(0);
    }
  }

  function openForgotPassword() {
    setForgotForm((previous) => ({ ...previous, email: form.email }));
    setForgotErrors({});
    setForgotServerError("");
    setForgotOpen(true);
  }

  async function sendForgotCode() {
    if (forgotCountdown > 0) return;
    const emailError = validateEmail(forgotForm.email);
    if (emailError) {
      setForgotErrors({ email: emailError });
      return;
    }
    try {
      setForgotLoading(true);
      const response = await api.post("/api/user-portal/auth/forgot-password", { email: forgotForm.email });
      if (response.data.success) {
        setForgotCodeSent(true);
        setForgotCountdown(60);
        setShowForgotCodeNotice(true);
      }
    } catch (error: unknown) {
      setForgotServerError(axios.isAxiosError(error) ? error.response?.data?.message ?? "Could not send reset code" : "Could not send reset code");
    } finally {
      setForgotLoading(false);
    }
  }

  async function resetForgotPassword() {
    const nextErrors: ForgotErrors = {};
    if (!validateEmail(forgotForm.email)) {
      // valid
    } else nextErrors.email = validateEmail(forgotForm.email);
    if (!/^\d{6}$/.test(forgotForm.verificationCode)) nextErrors.verificationCode = "Enter the 6-digit code";
    if (!forgotForm.newPassword) nextErrors.newPassword = "New password is required";
    else if (forgotForm.newPassword.length < 8) nextErrors.newPassword = "Minimum 8 characters";
    else if (!/[A-Z]/.test(forgotForm.newPassword) || !/[a-z]/.test(forgotForm.newPassword) || !/[0-9]/.test(forgotForm.newPassword) || !/[!@#$%^&*]/.test(forgotForm.newPassword)) nextErrors.newPassword = "Use uppercase, lowercase, number and special character";
    if (forgotForm.newPassword !== forgotForm.confirmPassword) nextErrors.confirmPassword = "Passwords do not match";
    setForgotErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    try {
      setForgotLoading(true);
      await api.post("/api/user-portal/auth/reset-password", forgotForm);
      setForgotOpen(false);
      setForgotSuccess(true);
    } catch (error: unknown) {
      setForgotServerError(axios.isAxiosError(error) ? error.response?.data?.message ?? "Could not reset password" : "Could not reset password");
    } finally {
      setForgotLoading(false);
    }
  }

  function initializeGoogle() {
    if (googleInitializedRef.current || !googleClientId || !googleButtonRef.current || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      ux_mode: "popup",
      auto_select: false,
      use_fedcm_for_button: false,
      button_auto_select: false,
      callback: async (response) => {
        try {
          setGoogleLoading(true);
          setServerError("");
          const result = await authApi.post("/api/user-portal/auth/google", {
            credential: response.credential,
          });
          clearCurrentUserCache();
          await authApi.get("/api/user-portal/auth/me");
          if (result.data.isNewUser) {
            window.location.href = "/google-complete";
            return;
          }
          setShowWelcomeBack(true);
        } catch (error: unknown) {
          setServerError(
            axios.isAxiosError(error)
              ? error.response?.data?.message ?? "Google login failed"
              : "Google login failed",
          );
        } finally {
          setGoogleLoading(false);
        }
      },
    });
    googleInitializedRef.current = true;
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: Math.min(360, Math.max(260, googleButtonRef.current.clientWidth || 320)),
      locale: "en",
    });
    setGoogleReady(true);
  }

  function openGooglePrompt() {
    initializeGoogle();
    if (!window.google || !googleInitializedRef.current) {
      setServerError("Google Sign-In is still loading. Please try again in a moment.");
      return;
    }
    setServerError("");
    setGoogleLoading(true);
    window.google.accounts.id.prompt();
    window.setTimeout(() => setGoogleLoading(false), 1000);
  }

  useEffect(() => {
    if (!googleClientId) return;
    let attempts = 0;
    const attempt = () => {
      initializeGoogle();
      attempts += 1;
      if (googleInitializedRef.current || attempts >= 50) return;
      window.setTimeout(attempt, 100);
    };
    attempt();
  }, [googleClientId]);

  async function login() {
    setSubmitted(true);
    setServerError("");
    if (!validateAll()) return;

    try {
      setLoading(true);
      const response = await authApi.post("/api/user-portal/auth/login", form);
      clearCurrentUserCache();
      await authApi.get("/api/user-portal/auth/me");
      if (response.data.user.role === "ADMIN") {
        setServerError("Admin accounts cannot login here");
        return;
      }
      setShowWelcomeBack(true);
    } catch (error: unknown) {
      setServerError(
        axios.isAxiosError(error)
          ? error.response?.data?.message ?? "Login failed"
          : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthBackdrop>
      {showForgotCodeNotice ? (
        <AuthNotice
          title="Code sent"
          message={`We sent a password reset code to ${forgotForm.email}. Please check your Gmail inbox or Spam folder.`}
          onDone={() => setShowForgotCodeNotice(false)}
        />
      ) : null}

      {forgotSuccess ? (
        <AuthNotice title="Password updated" message="Your password has been reset successfully. You can now log in with the new password." onDone={() => setForgotSuccess(false)} />
      ) : null}

      {forgotOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="forgot-password-title">
          <div className="max-h-[92vh] w-full max-w-[460px] overflow-y-auto rounded-3xl border border-[#7898bf]/15 bg-[#101a3a] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.5)] sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div><h2 id="forgot-password-title" className="text-2xl font-bold text-white">Forgot password?</h2><p className="mt-2 text-sm leading-6 text-slate-300">Send a code to your Gmail and choose a new password.</p></div>
              <button type="button" onClick={() => setForgotOpen(false)} className="rounded-xl px-3 py-2 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Close forgot password">×</button>
            </div>
            {forgotServerError ? <AuthError message={forgotServerError} /> : null}
            <div className="space-y-4">
              <div><AuthLabel>Gmail</AuthLabel><input type="email" value={forgotForm.email} placeholder="example@gmail.com" onChange={(event) => updateForgot("email", event.target.value)} className={authInputClass(Boolean(forgotErrors.email))} /><FieldError message={forgotErrors.email} /></div>
              <div><AuthLabel>Verification code</AuthLabel><div className="flex gap-2"><input value={forgotForm.verificationCode} inputMode="numeric" maxLength={6} placeholder="6-digit code" onChange={(event) => updateForgot("verificationCode", event.target.value.replace(/\D/g, ""))} className={`${authInputClass(Boolean(forgotErrors.verificationCode))} min-w-0 flex-1`} /><button type="button" onClick={sendForgotCode} disabled={forgotLoading || forgotCountdown > 0} className="min-w-[7.2rem] rounded-2xl border border-[#7898bf]/25 bg-[#20385f]/30 px-3 text-xs font-bold text-[#c6d7ea] disabled:cursor-not-allowed disabled:opacity-60">{forgotLoading ? <MoonSpinner label="Sending" /> : forgotCountdown > 0 ? `Resend in ${forgotCountdown}s` : forgotCodeSent ? "Resend code" : "Send code"}</button></div><FieldError message={forgotErrors.verificationCode} /></div>
              <div><AuthLabel>New password</AuthLabel><div className="relative"><input type={showForgotPassword ? "text" : "password"} value={forgotForm.newPassword} onChange={(event) => updateForgot("newPassword", event.target.value)} className={`${authInputClass(Boolean(forgotErrors.newPassword))} pr-12`} /><button type="button" onClick={() => setShowForgotPassword((value) => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" aria-label="Toggle new password">{showForgotPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div><FieldError message={forgotErrors.newPassword} /></div>
              <div><AuthLabel>Confirm password</AuthLabel><div className="relative"><input type={showForgotConfirm ? "text" : "password"} value={forgotForm.confirmPassword} onChange={(event) => updateForgot("confirmPassword", event.target.value)} className={`${authInputClass(Boolean(forgotErrors.confirmPassword))} pr-12`} /><button type="button" onClick={() => setShowForgotConfirm((value) => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" aria-label="Toggle password confirmation">{showForgotConfirm ? <EyeOff size={19} /> : <Eye size={19} />}</button></div><FieldError message={forgotErrors.confirmPassword} /></div>
              <button type="button" onClick={resetForgotPassword} disabled={forgotLoading} className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 py-3.5 text-sm font-bold text-slate-950 disabled:opacity-60">{forgotLoading ? <MoonSpinner label="Updating" /> : "Reset password"}</button>
            </div>
          </div>
        </div>
      ) : null}

      {showWelcomeBack ? (
        <AuthNotice
          title="Welcome back"
          message="Your Broadcast360 account is ready. Taking you to your account now."
          onDone={() => { window.location.href = "/profile"; }}
        />
      ) : null}

      <div className="mx-auto w-full max-w-[440px] rounded-[2rem] border border-[#7898bf]/15 bg-[#101a3a]/95 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-8">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#a9c0dd]/70">Broadcast360</p>
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
              onChange={(event) => handleChange("email", event.target.value)}
              className={authInputClass(Boolean(errors.email))}
            />
            <FieldError message={errors.email} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <AuthLabel>Password</AuthLabel>
              <button type="button" onClick={openForgotPassword} className="text-xs font-semibold text-[#b7cbe4] hover:text-white">Forgot password?</button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                autoComplete="current-password"
                onChange={(event) => handleChange("password", event.target.value)}
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
            className="w-full rounded-2xl bg-[#284a78] py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-black/20 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? <MoonSpinner label="Authenticating" /> : "Login"}
          </button>
        </div>

        {googleClientId ? (
          <>
            <GoogleDivider />
            <GoogleButtonSlot googleButtonRef={googleButtonRef} onClick={openGooglePrompt} googleReady={googleReady} loading={googleLoading} />
            <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={initializeGoogle} />
          </>
        ) : null}

        <p className="mt-8 text-center text-sm text-slate-400">
          Don&apos;t have an account?
          <Link href="/register" className="ml-1.5 font-semibold text-[#b7cbe4] transition hover:text-white">Sign up</Link>
        </p>
      </div>
    </AuthBackdrop>
  );
}
