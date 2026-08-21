"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AuthBackdrop, AuthError, AuthLabel, authInputClass, MoonSpinner } from "@/components/auth/AuthUi";

type FormState = {
  name: string;
  email: string;
  message: string;
};

export default function ReactivationPage() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", message: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const message = form.message.trim();

    if (name.length < 2) return setError("Please enter your name.");
    if (!email.endsWith("@gmail.com")) return setError("Only Gmail accounts are allowed.");
    if (message.length < 10) return setError("Please explain why you need the account reactivated.");

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/user-portal/auth/support/reactivation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to send request");
      setSent(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthBackdrop>
      <div className="mx-auto w-full max-w-[520px] rounded-[2rem] border border-[#7898bf]/15 bg-[#101a3a]/95 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-8">
        <Link href="/login" className="mb-7 inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </Link>

        {sent ? (
          <div className="py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-2xl font-bold text-white">Request sent</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">The admin team received your request. They will review your account and activate it if approved.</p>
            <Link href="/login" className="mt-7 inline-flex rounded-xl bg-gradient-to-r from-[#4f6689] to-[#7898bf] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Return to Login</Link>
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a9c0dd]/70">FlickScope Support</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Reactivate account</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300">If your account became inactive after three months without login, send a request to the admin team. This is a regular support message, not live chat.</p>
            </div>

            {error ? <div className="mt-6"><AuthError message={error} /></div> : null}

            <form onSubmit={submit} className="mt-7 space-y-5">
              <div>
                <AuthLabel>Name</AuthLabel>
                <input value={form.name} onChange={(event) => update("name", event.target.value)} className={authInputClass(false)} placeholder="Your name" autoComplete="name" />
              </div>
              <div>
                <AuthLabel>Gmail</AuthLabel>
                <input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className={authInputClass(false)} placeholder="example@gmail.com" autoComplete="email" />
              </div>
              <div>
                <AuthLabel>Message</AuthLabel>
                <textarea value={form.message} onChange={(event) => update("message", event.target.value)} className={`${authInputClass(false)} min-h-36 resize-y`} placeholder="Please tell the admin why you need your account reactivated." />
              </div>
              <button type="submit" disabled={loading} className="flickscope-primary-action flex w-full items-center justify-center rounded-2xl py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? <MoonSpinner label="Sending" /> : "Send reactivation request"}
              </button>
            </form>
          </>
        )}
      </div>
    </AuthBackdrop>
  );
}
