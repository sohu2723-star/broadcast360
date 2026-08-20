"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

import authApi from "@/lib/authapi";
import {
  AuthBackdrop,
  AuthError,
  AuthLabel,
  AuthNotice,
  AuthTransitionLoader,
  MoonSpinner,
  authInputClass,
  FieldError,
} from "@/components/auth/AuthUi";
import DobPicker from "@/components/auth/DobPicker";
import CaptchaChallenge from "@/components/auth/CaptchaChallenge";

type Gender = "" | "MALE" | "FEMALE" | "OTHER" | "UNSPECIFIED";

type FormState = { name: string; dateOfBirth: string; gender: Gender };
type CaptchaState = { token: string; answer: string; checked: boolean };
type Errors = Partial<Record<keyof FormState, string>>;

export default function GoogleCompletePage() {
  const [form, setForm] = useState<FormState>({ name: "", dateOfBirth: "", gender: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [policyError, setPolicyError] = useState("");
  const [captcha, setCaptcha] = useState<CaptchaState>({ token: "", answer: "", checked: false });
  const [captchaError, setCaptchaError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [authTransitionLoading, setAuthTransitionLoading] = useState(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    authApi.get("/api/user-portal/auth/me")
      .then((response) => {
        if (!active) return;
        setForm((previous) => ({ ...previous, name: response.data.user?.name ?? "" }));
      })
      .catch(() => {
        if (active) {
          setSessionExpired(true);
          setServerError("Your Google session has expired. Please sign in again.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  useEffect(() => {
    if (completed) {
      redirectTimer.current = setTimeout(() => { window.location.href = "/profile"; }, 1700);
    }
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, [completed]);

  function validate() {
    const nextErrors: Errors = {};
    if (!form.name.trim() || form.name.trim().length < 2) nextErrors.name = "Name must be at least 2 characters";
    if (!form.dateOfBirth) nextErrors.dateOfBirth = "Date of birth is required";
    if (!form.gender) nextErrors.gender = "Please choose a gender";
    if (!acceptedPolicy) setPolicyError("Please accept the Broadcast360 policy");
    if (!captcha.checked) setCaptchaError("Please confirm that you are not a robot");
    else if (!captcha.answer) setCaptchaError("Enter the CAPTCHA characters");
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0 && acceptedPolicy && captcha.checked && Boolean(captcha.answer);
  }

  function updateCaptcha(value: CaptchaState) {
    setCaptcha(value);
    if (value.checked && value.answer) setCaptchaError("");
  }

  function update(field: keyof FormState, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  async function createAccount() {
    if (!validate()) return;
    try {
      setSaving(true);
      setServerError("");
      await authApi.put("/api/user-portal/auth/profile", {
        name: form.name.trim(),
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        acceptedPolicy,
        captchaToken: captcha.token,
        captchaAnswer: captcha.answer,
      });
      setAuthTransitionLoading(true);
      window.setTimeout(() => setCompleted(true), 550);
    } catch (error: unknown) {
      setServerError(
        axios.isAxiosError(error)
          ? error.response?.data?.message ?? "Could not complete your profile"
          : "Could not complete your profile",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthBackdrop>
      {authTransitionLoading ? <AuthTransitionLoader label="Creating your account..." /> : null}

      {completed ? (
        <AuthNotice title="Welcome" message="Your account is ready. Taking you to your Broadcast360 account now." />
      ) : null}

      <div className="mx-auto w-full max-w-[480px] rounded-[2rem] border border-[#7898bf]/15 bg-[#101a3a]/95 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-8">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#a9c0dd]/70">Broadcast360</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Complete your profile</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">Just a few details before you enter your new account.</p>
        </div>

        {serverError ? <AuthError message={serverError} /> : null}
        {sessionExpired ? (
          <Link href="/login" className="b360-primary-action mt-5 block w-full rounded-2xl py-3.5 text-center text-sm font-bold">
            Sign in with Google again
          </Link>
        ) : null}
        {loading ? (
          <div className="flex justify-center py-10 text-sm text-[#c6d7ea]"><MoonSpinner label="Checking your Google account" /></div>
        ) : sessionExpired ? null : (
          <div className="space-y-5">
            <div>
              <AuthLabel>Name</AuthLabel>
              <input value={form.name} autoComplete="name" onChange={(event) => update("name", event.target.value)} className={authInputClass(Boolean(errors.name))} />
              <FieldError message={errors.name} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <AuthLabel>Date of Birth</AuthLabel>
                <DobPicker
                  value={form.dateOfBirth}
                  onChange={(value) => update("dateOfBirth", value)}
                  hasError={Boolean(errors.dateOfBirth)}
                />
                <FieldError message={errors.dateOfBirth} />
              </div>
              <div>
                <AuthLabel>Gender</AuthLabel>
                <select value={form.gender} onChange={(event) => update("gender", event.target.value)} className={`${authInputClass(Boolean(errors.gender))} appearance-none`}>
                  <option value="" disabled>Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="UNSPECIFIED">Prefer not to say</option>
                </select>
                <FieldError message={errors.gender} />
              </div>
            </div>
            <CaptchaChallenge
              token={captcha.token}
              answer={captcha.answer}
              checked={captcha.checked}
              error={captchaError}
              onChange={updateCaptcha}
            />
            <div className="rounded-2xl border border-[#7898bf]/15 bg-[#0b1636]/45 px-4 py-3">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={acceptedPolicy}
                  onChange={(event) => {
                    setAcceptedPolicy(event.target.checked);
                    if (event.target.checked) setPolicyError("");
                  }}
                  className="mt-0.5 h-4 w-4 accent-[#7898bf]"
                />
                <span>I agree to the Broadcast360 <Link href="/policy" target="_blank" className="font-semibold text-[#c5d7ee] underline underline-offset-4 hover:text-white">policy</Link>.</span>
              </label>
              <FieldError message={policyError} />
            </div>
            <button type="button" onClick={createAccount} disabled={saving} className="b360-primary-action w-full rounded-2xl py-3.5 text-sm font-bold">
              {saving ? <MoonSpinner label="Creating account" /> : "Create Account"}
            </button>
          </div>
        )}
      </div>
    </AuthBackdrop>
  );
}
