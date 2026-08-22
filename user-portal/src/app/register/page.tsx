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
  AuthTransitionLoader,
  GoogleButtonSlot,
  GoogleDivider,
  MoonSpinner,
  authInputClass,
  FieldError,
} from "@/components/auth/AuthUi";
import TurnstileWidget from "@/components/auth/TurnstileWidget";

type GoogleCredentialResponse = { credential: string };

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  verificationCode: string;
};

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;
type TurnstileState = { token: string };

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

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    verificationCode: "",
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [showCodeSentNotice, setShowCodeSentNotice] = useState(false);
  const [serverError, setServerError] = useState("");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [policyError, setPolicyError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [welcomeTitle, setWelcomeTitle] = useState("");
  const [authTransitionLoading, setAuthTransitionLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleInitializedRef = useRef(false);
  const turnstileRef = useRef<TurnstileState>({ token: "" });
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    turnstileRef.current = { token: turnstileToken };
  }, [turnstileToken]);

  useEffect(() => {
    if (!welcomeTitle) return;
    const timer = window.setTimeout(() => { window.location.href = "/profile"; }, 1700);
    return () => window.clearTimeout(timer);
  }, [welcomeTitle]);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCountdown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCountdown]);

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
    if (passwordError) nextErrors.password = passwordError;
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match";
    if (!/^\d{6}$/.test(form.verificationCode)) nextErrors.verificationCode = "Enter the 6-digit code sent to Gmail";
    if (!acceptedPolicy) setPolicyError("Please accept the FlickScope policy");
    if (!turnstileToken) setTurnstileError("Please complete the Cloudflare security check");
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0 && acceptedPolicy && Boolean(turnstileToken);
  }

  function updateTurnstile(token: string) {
    setTurnstileToken(token);
    if (token) setTurnstileError("");
  }

  function handleChange(field: keyof RegisterForm, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
    if (serverError) setServerError("");
    if (field === "email") {
      setCodeSent(false);
      setResendCountdown(0);
    }
  }

  async function sendCode() {
    if (resendCountdown > 0) return;
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
      setResendCountdown(60);
      setShowCodeSentNotice(true);
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
            turnstileToken: turnstileRef.current.token,
          });
          clearCurrentUserCache();
          await authApi.get("/api/user-portal/auth/me");
          if (result.data.isNewUser) {
            setAuthTransitionLoading(true);
            window.setTimeout(() => { window.location.href = "/google-complete"; }, 550);
            return;
          }
          setAuthTransitionLoading(true);
          window.setTimeout(() => setWelcomeTitle("Welcome back"), 550);
        } catch (error: unknown) {
          setServerError(
            axios.isAxiosError(error)
              ? error.response?.data?.message ?? "Google signup failed"
              : "Google signup failed",
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
      width: Math.min(360, Math.max(180, Math.floor(googleButtonRef.current.getBoundingClientRect().width || 320))),
      locale: "en",
    });
    setGoogleReady(true);
  }

  function openGooglePrompt() {
    if (!turnstileToken) {
      setTurnstileError("Please complete the Cloudflare security check");
      return;
    }
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
        verificationCode: form.verificationCode,
        acceptedPolicy,
        turnstileToken,
      });
      await authApi.post("/api/user-portal/auth/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        turnstileToken,
      });
      clearCurrentUserCache();
      await authApi.get("/api/user-portal/auth/me");
      setAuthTransitionLoading(true);
      window.setTimeout(() => setWelcomeTitle("Welcome"), 550);
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
      {authTransitionLoading ? <AuthTransitionLoader label="Creating your account..." /> : null}

      {showCodeSentNotice ? (
        <AuthNotice
          title="Code sent"
          message={`We sent a 6-digit verification code to ${form.email}. Please check your Gmail inbox or Spam folder.`}
          onDone={() => setShowCodeSentNotice(false)}
        />
      ) : null}

      {welcomeTitle ? (
        <AuthNotice
          title={welcomeTitle}
          message="Your FlickScope account is ready. Taking you to your account now."
          onDone={() => { window.location.href = "/profile"; }}
        />
      ) : null}

      <div className="mx-auto w-full max-w-[480px] rounded-[2rem] border border-white/10 bg-[#1f1f1f]/95 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-8">
        <div className="mb-7 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">FlickScope</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Create Account</h1>
          <p className="mt-2 text-sm text-slate-300">Register your FlickScope account</p>
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

          <div>
            <AuthLabel>Email verification code</AuthLabel>
            <div className="flex gap-2">
              <input value={form.verificationCode} inputMode="numeric" maxLength={6} placeholder="6-digit code" onChange={(event) => handleChange("verificationCode", event.target.value.replace(/\D/g, ""))} className={`${field("verificationCode")} min-w-0 flex-1`} />
              <button type="button" onClick={sendCode} disabled={codeLoading || resendCountdown > 0} className="min-w-[7.4rem] rounded-2xl border border-white/15 bg-white/5 px-3 text-xs font-bold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60">
                {codeLoading ? <MoonSpinner label="Sending" /> : resendCountdown > 0 ? `Resend in ${resendCountdown}s` : codeSent ? "Resend code" : "Send code"}
              </button>
            </div>
            <FieldError message={errors.verificationCode} />
            {codeSent ? <p className="mt-2 text-xs text-white/65">Code sent. You can request another code when the timer reaches 0.</p> : null}
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

          <TurnstileWidget token={turnstileToken} error={turnstileError} onChange={updateTurnstile} />

          <div className="rounded-2xl border border-[#7898bf]/15 bg-[#171717]/60 px-4 py-3">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={acceptedPolicy}
                onChange={(event) => {
                  setAcceptedPolicy(event.target.checked);
                  if (event.target.checked) setPolicyError("");
                }}
                className="mt-0.5 h-4 w-4 accent-white"
              />
              <span>
                I agree to the FlickScope{" "}
                <Link href="/policy" target="_blank" className="font-semibold text-white/80 underline underline-offset-4 hover:text-white">
                  policy
                </Link>
                .
              </span>
            </label>
            <FieldError message={policyError} />
          </div>

          <button type="button" onClick={register} disabled={loading} className="flickscope-primary-action w-full rounded-2xl py-3.5 text-sm font-bold">
            {loading ? <MoonSpinner label="Creating account" /> : "Create Account"}
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
          Already have an account?
          <Link href="/login" className="ml-1.5 font-semibold text-white/65 transition hover:text-white">Login</Link>
        </p>
      </div>
    </AuthBackdrop>
  );
}
