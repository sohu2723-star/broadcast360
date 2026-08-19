"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";

import authApi from "@/lib/authapi";
import {
  AuthBackdrop,
  AuthError,
  AuthLabel,
  AuthNotice,
  MoonSpinner,
  authInputClass,
  FieldError,
} from "@/components/auth/AuthUi";

type Gender = "" | "MALE" | "FEMALE" | "OTHER" | "UNSPECIFIED";

type FormState = { name: string; dateOfBirth: string; gender: Gender };
type Errors = Partial<Record<keyof FormState, string>>;

export default function GoogleCompletePage() {
  const [form, setForm] = useState<FormState>({ name: "", dateOfBirth: "", gender: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    authApi.get("/api/user-portal/auth/me")
      .then((response) => {
        if (!active) return;
        setForm((previous) => ({ ...previous, name: response.data.user?.name ?? "" }));
      })
      .catch(() => {
        if (active) setServerError("Your Google session has expired. Please sign in again.");
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
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
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
      });
      setCompleted(true);
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
      {completed ? (
        <AuthNotice title="Welcome" message="Your account is ready. Taking you to your Broadcast360 account now." />
      ) : null}

      <div className="mx-auto w-full max-w-[480px] rounded-[2rem] border border-blue-200/10 bg-[#16265b]/90 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-8">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/70">Broadcast360</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Complete your profile</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">Just a few details before you enter your new account.</p>
        </div>

        {serverError ? <AuthError message={serverError} /> : null}
        {loading ? (
          <div className="flex justify-center py-10 text-sm text-cyan-100"><MoonSpinner label="Checking your Google account" /></div>
        ) : (
          <div className="space-y-5">
            <div>
              <AuthLabel>Name</AuthLabel>
              <input value={form.name} autoComplete="name" onChange={(event) => update("name", event.target.value)} className={authInputClass(Boolean(errors.name))} />
              <FieldError message={errors.name} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <AuthLabel>Date of Birth</AuthLabel>
                <input type="date" value={form.dateOfBirth} onChange={(event) => update("dateOfBirth", event.target.value)} className={authInputClass(Boolean(errors.dateOfBirth))} />
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
            <button type="button" onClick={createAccount} disabled={saving} className="w-full rounded-2xl bg-gradient-to-r from-blue-500 via-blue-500 to-cyan-400 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-blue-950/30 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70">
              {saving ? <MoonSpinner label="Creating account" /> : "Create Account"}
            </button>
          </div>
        )}
      </div>
    </AuthBackdrop>
  );
}
