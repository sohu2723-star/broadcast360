"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import api from "@/lib/api";
import {
  AuthBackdrop,
  AuthError,
  AuthLabel,
  AuthNotice,
  FieldError,
  MoonSpinner,
  authInputClass,
} from "@/components/auth/AuthUi";

type Step = "email" | "otp" | "password" | "success";
type PasswordReuseStatus = "unknown" | "invalid" | "valid";

type RuleRowProps = {
  label: string;
  passed: boolean;
  pending?: boolean;
};

function RuleRow({ label, passed, pending = false }: RuleRowProps) {
  const stateClass = pending
    ? "border-white/10 bg-white/[0.03] text-slate-400"
    : passed
      ? "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-100/90"
      : "border-red-300/20 bg-red-300/[0.045] text-red-100/80";

  return (
    <li className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${stateClass}`}>
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-bold" aria-hidden="true">
        {pending ? "•" : passed ? "✓" : "!"}
      </span>
      <span>{label}</span>
    </li>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailChecked, setEmailChecked] = useState(false);
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [reuseStatus, setReuseStatus] = useState<PasswordReuseStatus>("unknown");

  useEffect(() => {
    if (step !== "otp" || countdown <= 0) return;
    const timer = window.setInterval(() => {
      setCountdown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step, countdown]);

  const passwordRules = useMemo(() => ({
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    matches: Boolean(newPassword) && newPassword === confirmPassword,
  }), [newPassword, confirmPassword]);

  const passwordIsValid = Object.values(passwordRules).every(Boolean);
  const normalizedEmail = email.trim().toLowerCase();

  function validateEmail() {
    if (!normalizedEmail) return "Gmail address is required";
    if (!/^[^\s@]+@gmail\.com$/i.test(normalizedEmail)) return "Only @gmail.com accounts are allowed";
    return "";
  }

  async function checkEmail() {
    const validationError = validateEmail();
    if (validationError) {
      setEmailError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setEmailError("");
    setAccountNotFound(false);
    try {
      const response = await api.post("/api/user-portal/auth/check-email", { email: normalizedEmail });
      if (!response.data?.exists || !response.data?.resettable) {
        setEmailChecked(false);
        setAccountNotFound(true);
        return;
      }
      setEmail(normalizedEmail);
      setEmailChecked(true);
    } catch (requestError: unknown) {
      setEmailChecked(false);
      setError(getErrorMessage(requestError, "We could not check this Gmail account. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  async function sendCode() {
    setLoading(true);
    setError("");
    try {
      await api.post("/api/user-portal/auth/forgot-password", { email: normalizedEmail });
      setCountdown(60);
      setVerificationCode("");
      setStep("otp");
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, "We could not send the verification code. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailNext(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!emailChecked) {
      await checkEmail();
    } else {
      await sendCode();
    }
  }

  async function resendCode() {
    if (countdown > 0 || loading) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/api/user-portal/auth/forgot-password", { email: normalizedEmail });
      setCountdown(60);
      setVerificationCode("");
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, "We could not resend the code. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = verificationCode.trim();
    if (!/^\d{6}$/.test(code)) {
      setOtpError("Enter the 6-digit code sent to your Gmail");
      return;
    }

    setLoading(true);
    setError("");
    setOtpError("");
    try {
      await api.post("/api/user-portal/auth/verify-reset-code", {
        email: normalizedEmail,
        verificationCode: code,
      });
      setStep("password");
    } catch (requestError: unknown) {
      setOtpError(getErrorMessage(requestError, "That code is invalid or expired."));
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setReuseStatus("unknown");
    if (!passwordIsValid) {
      setPasswordError("Complete every password requirement before continuing");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.post("/api/user-portal/auth/reset-password", {
        email: normalizedEmail,
        verificationCode: verificationCode.trim(),
        newPassword,
        confirmPassword,
      });
      setReuseStatus("valid");
      setStep("success");
      window.setTimeout(() => { window.location.href = "/login"; }, 2000);
    } catch (requestError: unknown) {
      const message = getErrorMessage(requestError, "Could not update your password. Please try again.");
      if (message.toLowerCase().includes("different") || message.toLowerCase().includes("previous")) {
        setReuseStatus("invalid");
      }
      setPasswordError(message);
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    setError("");
    setEmailError("");
    setOtpError("");
    setPasswordError("");
    if (step === "email") {
      window.location.href = "/login";
    } else if (step === "otp") {
      setStep("email");
      setEmailChecked(true);
    } else {
      setStep("otp");
    }
  }

  return (
    <AuthBackdrop>
      <div className="mx-auto w-full max-w-[440px]">
        <div className="mb-5 flex items-center justify-between px-1">
          <Link href="/login" className="text-sm font-semibold text-[#b7cbe4] transition hover:text-white">
            ← Back to login
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">FlickScope</span>
        </div>

        <section className="rounded-[2rem] border border-[#7898bf]/15 bg-[#101a3a]/95 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-8">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9cb9dc]">Account recovery</p>
            <h1 className="mt-2 text-2xl font-bold text-white">
              {step === "email" ? "Forgot password?" : step === "otp" ? "Check your Gmail" : step === "password" ? "Create a new password" : "Password updated"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {step === "email"
                ? "Enter the Gmail address connected to your FlickScope account."
                : step === "otp"
                  ? `We sent a 6-digit code to ${normalizedEmail}.`
                  : step === "password"
                    ? "Choose a strong password you have not used before."
                    : "Your FlickScope password has been changed successfully."}
            </p>
          </div>

          {error ? <div className="mb-5"><AuthError message={error} /></div> : null}

          {step === "email" ? (
            <form onSubmit={handleEmailNext} className="space-y-5">
              <div>
                <AuthLabel>Gmail address</AuthLabel>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setEmailChecked(false);
                    setAccountNotFound(false);
                    setEmailError("");
                    setError("");
                  }}
                  placeholder="you@gmail.com"
                  className={authInputClass(Boolean(emailError))}
                  disabled={loading}
                />
                <FieldError message={emailError} />
              </div>

              {accountNotFound ? (
                <div className="rounded-2xl border border-amber-200/20 bg-amber-100/[0.05] px-4 py-3 text-sm leading-6 text-amber-100/85">
                  No FlickScope account was found for this Gmail. <Link href="/register" className="font-semibold text-white underline underline-offset-4">Sign up instead</Link>
                </div>
              ) : null}

              {emailChecked ? (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] px-4 py-3 text-sm text-emerald-100/90">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-300/15 text-emerald-200" aria-hidden="true">✓</span>
                  <span>FlickScope account found. Continue to receive your code.</span>
                </div>
              ) : null}

              <button type="submit" disabled={loading} className="flickscope-primary-action w-full rounded-2xl py-3.5 text-sm font-bold">
                {loading ? <MoonSpinner label="Checking" /> : emailChecked ? "Send verification code" : "Next"}
              </button>
            </form>
          ) : null}

          {step === "otp" ? (
            <form onSubmit={verifyCode} className="space-y-5">
              <div>
                <AuthLabel>Verification code</AuthLabel>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(event) => {
                    setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setOtpError("");
                  }}
                  placeholder="000000"
                  className={`${authInputClass(Boolean(otpError))} text-center text-lg tracking-[0.45em]`}
                  disabled={loading}
                />
                <FieldError message={otpError} />
              </div>
              <button type="submit" disabled={loading} className="flickscope-primary-action w-full rounded-2xl py-3.5 text-sm font-bold">
                {loading ? <MoonSpinner label="Verifying" /> : "Next"}
              </button>
              <div className="text-center text-xs text-slate-400">
                {countdown > 0 ? (
                  <span>You can request another code in <strong className="text-slate-200">{countdown}s</strong></span>
                ) : (
                  <button type="button" onClick={resendCode} className="font-semibold text-[#b7cbe4] hover:text-white">Resend code</button>
                )}
              </div>
            </form>
          ) : null}

          {step === "password" ? (
            <form onSubmit={resetPassword} className="space-y-5">
              <div>
                <AuthLabel>New password</AuthLabel>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setPasswordError("");
                    setReuseStatus("unknown");
                  }}
                  placeholder="Create a strong password"
                  className={authInputClass(Boolean(passwordError))}
                  disabled={loading}
                />
              </div>
              <div>
                <AuthLabel>Confirm new password</AuthLabel>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Repeat your password"
                  className={authInputClass(Boolean(passwordError))}
                  disabled={loading}
                />
              </div>

              <ul className="grid gap-2 sm:grid-cols-2" aria-label="Password requirements">
                <RuleRow label="At least 8 characters" passed={passwordRules.length} />
                <RuleRow label="One uppercase letter" passed={passwordRules.uppercase} />
                <RuleRow label="One lowercase letter" passed={passwordRules.lowercase} />
                <RuleRow label="One number" passed={passwordRules.number} />
                <RuleRow label="One special character" passed={passwordRules.special} />
                <RuleRow label="Passwords match" passed={passwordRules.matches} />
                <li className={`sm:col-span-2 ${reuseStatus === "invalid" ? "" : "opacity-80"}`}>
                  <RuleRow
                    label="Must be different from your previous password"
                    passed={reuseStatus === "valid"}
                    pending={reuseStatus === "unknown"}
                  />
                </li>
              </ul>
              <FieldError message={passwordError} />

              <button type="submit" disabled={loading} className="flickscope-primary-action w-full rounded-2xl py-3.5 text-sm font-bold">
                {loading ? <MoonSpinner label="Updating password" /> : "Update password"}
              </button>
            </form>
          ) : null}

          {step !== "success" ? (
            <button type="button" onClick={goBack} className="mt-5 w-full text-center text-xs font-semibold text-slate-500 transition hover:text-slate-200">
              {step === "email" ? "Cancel" : "Back"}
            </button>
          ) : null}
        </section>
      </div>

      {step === "success" ? (
        <AuthNotice
          title="Password updated"
          message="Your password has been changed. You will return to the FlickScope login page shortly."
          onDone={() => { window.location.href = "/login"; }}
        />
      ) : null}
    </AuthBackdrop>
  );
}
