"use client";

import { useEffect, useState } from "react";
import authApi from "@/lib/authapi";
import Link from "next/link";

interface SubscriptionPlan {
  id: number;
  name: string;
  description?: string | null;
}

interface SubscriptionOption {
  id: number;
  planId: number;
  durationDays: number;
  price: string | number;
  discountPercent: string | number;
  isActive: boolean;
  plan: SubscriptionPlan;
}

interface ApiResponse {
  data: SubscriptionOption[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function SubscriptionPage() {
  const [options, setOptions] = useState<SubscriptionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOptions() {
      try {
        setLoading(true);
        setError("");

        const response = await authApi.get<ApiResponse>(
          "/api/user-portal/auth/subscription-options",
        );

        setOptions(response.data.data);
      } catch (error: any) {
        console.error("Failed to load subscription options:", error);

        setError(
          error?.response?.data?.message ??
          "Failed to load subscription plans.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOptions();
  }, []);

  function formatPrice(price: string | number) {
    return Number(price).toLocaleString("en-US");
  }

  function formatDuration(days: number) {
    if (days === 30) return "1 Month";
    if (days === 90) return "3 Months";
    if (days === 180) return "6 Months";
    if (days === 365) return "1 Year";

    return `${days} Days`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#040914] px-6 py-20 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-400">Loading subscription plans...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#040914] px-6 py-20 text-slate-100">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border border-rose-500/20 bg-rose-950/30 p-6 text-center backdrop-blur-md">
            <p className="text-sm font-medium text-rose-400">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#040914] px-6 py-16 text-slate-100 overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 -z-10 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="mb-14 text-center">
          <span className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Premium Access
          </span>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Choose Your Subscription
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base text-slate-400">
            Unlock premium Hxu Movie content, enjoy ad-free viewing, and get access to exclusive original programs.
          </p>
        </div>

        {/* EMPTY STATE */}
        {options.length === 0 ? (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-12 text-center backdrop-blur-md">
            <p className="text-slate-400">
              No subscription plans are currently available.
            </p>
          </div>
        ) : (
          /* GRID */
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {options.map((option) => {
              const price = Number(option.price);
              const discount = Number(option.discountPercent);
              const finalPrice = price - price * (discount / 100);

              const isBestValue = discount >= 20 || option.durationDays >= 180;

              return (
                <div
                  key={option.id}
                  className={`relative flex flex-col justify-between rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-1.5 ${isBestValue
                      ? "border-indigo-500/50 bg-slate-900/80 shadow-2xl shadow-indigo-950/50 ring-1 ring-indigo-500/20"
                      : "border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
                    } backdrop-blur-md`}
                >
                  {/* POPULAR BADGE */}
                  {isBestValue && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                      Best Value
                    </div>
                  )}

                  <div>
                    {/* PLAN NAME & DURATION */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {option.plan.name}
                        </h2>
                        {option.plan.description && (
                          <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                            {option.plan.description}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-semibold text-indigo-300">
                        {formatDuration(option.durationDays)}
                      </span>
                    </div>

                    {/* PRICING */}
                    <div className="my-6 border-y border-slate-800/80 py-5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold tracking-tight text-white">
                          {formatPrice(finalPrice)}
                        </span>
                        <span className="text-sm font-semibold text-slate-400">
                          MMK
                        </span>
                      </div>

                      {discount > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className="text-slate-500 line-through">
                            {formatPrice(price)} MMK
                          </span>
                          <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-400 border border-emerald-500/20">
                            Save {discount}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* FEATURES LIST */}
                    <ul className="mb-8 space-y-3 text-sm text-slate-300">
                      <li className="flex items-center gap-3">
                        <svg className="h-4 w-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Full HD & 4K Premium Streams</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <svg className="h-4 w-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Scheduled Content & Reminders</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <svg className="h-4 w-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Unlimited Multi-device Access</span>
                      </li>
                    </ul>
                  </div>
                  {/* ACTION BUTTON */}
                  <Link
                    href={`/subscription/checkout?optionId=${option.id}`}
                    className={`block w-full rounded-xl px-5 py-3.5 text-center text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${isBestValue
                        ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-blue-500"
                        : "border border-slate-700/60 bg-slate-800 text-white hover:border-slate-600 hover:bg-slate-700"
                      }`}
                  >
                    Subscribe Now
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}