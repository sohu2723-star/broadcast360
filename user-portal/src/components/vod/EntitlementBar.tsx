"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

import authApi from "@/lib/authapi";

type Entitlement = {
  isPremium: boolean;
  isTrial: boolean;
  creditBalance: number;
  trialEndsAt: string | null;
};

export default function EntitlementBar() {
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"trial" | "credit" | null>(null);
  const [message, setMessage] = useState("");

  async function refresh() {
    try {
      const response = await authApi.get("/api/user-portal/auth/entitlement");
      setEntitlement(response.data.entitlement ?? null);
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 401) {
        setMessage("Entitlement status is temporarily unavailable.");
      }
      setEntitlement(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function activateTrial() {
    setBusy("trial");
    setMessage("");
    try {
      await authApi.post("/api/user-portal/auth/trial");
      setMessage("Your one-day Premium trial is active.");
      await refresh();
    } catch (error) {
      setMessage(axios.isAxiosError(error) ? error.response?.data?.message ?? "Trial activation failed." : "Trial activation failed.");
    } finally {
      setBusy(null);
    }
  }

  async function claimDailyCredit() {
    setBusy("credit");
    setMessage("");
    try {
      await authApi.post("/api/user-portal/credits");
      setMessage("Daily credit added to your account.");
      await refresh();
    } catch (error) {
      setMessage(axios.isAxiosError(error) ? error.response?.data?.message ?? "Daily credit could not be claimed." : "Daily credit could not be claimed.");
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return <div className="mb-8 h-20 animate-pulse rounded-2xl border border-white/10 bg-[#1f1f1f]" aria-label="Loading access status" />;
  }

  if (!entitlement) {
    return (
      <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#1f1f1f] p-4 text-sm text-white/75 sm:flex-row sm:items-center sm:justify-between">
        <span>Sign in to view Premium access, trial, and credit status.</span>
        <a href="/login" className="rounded-lg bg-white px-4 py-2 text-center font-semibold text-[#141414] transition hover:bg-white/80">Sign in</a>
      </div>
    );
  }

  return (
    <section className="mb-8 rounded-2xl border border-white/10 bg-[#1f1f1f] p-4 text-sm text-white/80">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-semibold text-white">{entitlement.isPremium ? (entitlement.isTrial ? "Premium trial active" : "Premium access active") : "Free plan"}</p>
          <p className="mt-1 text-white/55">Credits available: <span className="font-semibold text-white/85">{entitlement.creditBalance}</span></p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!entitlement.isPremium ? <button type="button" onClick={activateTrial} disabled={busy !== null} className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 font-semibold text-white transition hover:bg-white/10 disabled:opacity-50">{busy === "trial" ? "Activating…" : "Try Premium for 1 day"}</button> : null}
          <button type="button" onClick={claimDailyCredit} disabled={busy !== null} className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 font-semibold text-white transition hover:bg-white/10 disabled:opacity-50">{busy === "credit" ? "Claiming…" : "Claim daily credit"}</button>
          {!entitlement.isPremium ? <Link href="/subscription" className="rounded-lg bg-white px-3 py-2 font-semibold text-[#141414] transition hover:bg-white/80">Upgrade</Link> : null}
        </div>
      </div>
      {message ? <p className="mt-3 text-xs text-white/60" role="status">{message}</p> : null}
    </section>
  );
}
