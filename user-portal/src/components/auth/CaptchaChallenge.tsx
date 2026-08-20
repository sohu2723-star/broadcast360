"use client";

import { RefreshCw, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import api from "@/lib/api";
import { FieldError, authInputClass } from "./AuthUi";

type CaptchaChallengeProps = {
  token: string;
  answer: string;
  checked: boolean;
  error?: string;
  onChange: (value: { token: string; answer: string; checked: boolean }) => void;
};

export default function CaptchaChallenge({ token, answer, checked, error, onChange }: CaptchaChallengeProps) {
  const [display, setDisplay] = useState("-----");
  const [loading, setLoading] = useState(false);

  const loadChallenge = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/user-portal/auth/captcha");
      setDisplay(response.data.display || "-----");
      onChange({ token: response.data.token, answer: "", checked: false });
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  useEffect(() => {
    if (!token) void loadChallenge();
  }, [token, loadChallenge]);

  return (
    <div className="rounded-2xl border border-[#7898bf]/20 bg-[#0b1636]/75 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#7898bf]/15 text-[#c5d7ee]">
          <ShieldCheck size={18} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Security check</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">This site is protected by CAPTCHA. Complete the check before continuing.</p>
        </div>
      </div>
      <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-slate-200">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange({ token, answer, checked: event.target.checked })}
          className="h-4 w-4 accent-[#7898bf]"
        />
        <span>I&apos;m not a robot</span>
      </label>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex h-11 min-w-0 flex-1 items-center justify-center rounded-xl border border-[#7898bf]/25 bg-[#101a3a] px-3 font-mono text-base font-bold tracking-[0.35em] text-[#d7e6f7] line-through decoration-[#7898bf]/70 select-none">
          {display}
        </div>
        <button type="button" onClick={() => void loadChallenge()} disabled={loading} className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 disabled:opacity-50" aria-label="Refresh CAPTCHA">
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      <input
        value={answer}
        onChange={(event) => onChange({ token, answer: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5), checked })}
        placeholder="Enter the 5 characters"
        className={`${authInputClass(Boolean(error))} mt-3 font-mono uppercase tracking-[0.18em]`}
        autoComplete="off"
        aria-label="CAPTCHA answer"
      />
      <FieldError message={error} />
    </div>
  );
}
