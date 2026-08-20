"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Subscription {
  id: number;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  plan: {
    id: number;
    name: string;
  };
  option: {
    id: number;
    durationDays: number;
    price: number | string;
    discountPercent: number | string;
  };
  payments: {
    id: number;
    amount: number | string;
    currency: string;
    method: string;
    transactionId: string | null;
    screenshotUrl: string | null;
    status: string;
    createdAt: string;
  }[];
}

const statusStyles: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  PENDING: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "bg-amber-400",
    border: "border-amber-500/20",
  },
  ACTIVE: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    border: "border-emerald-500/20",
  },
  EXPIRED: {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    dot: "bg-slate-400",
    border: "border-slate-500/20",
  },
  CANCELLED: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    dot: "bg-rose-400",
    border: "border-rose-500/20",
  },
};

const paymentStatusStyles: Record<string, string> = {
  PENDING: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  APPROVED: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  REJECTED: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(days: number) {
  if (days === 30) return "1 Month";
  if (days === 90) return "3 Months";
  if (days === 180) return "6 Months";
  if (days === 365) return "1 Year";
  return `${days} Days`;
}

export default function SubscriptionsPage() {
  const router = useRouter();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  const fetchSubscriptions = useCallback(async () => {
  try {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (status) {
      params.set("status", status);
    }

    const response = await fetch(`/api/subscriptions?${params.toString()}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    // 1. Guard against non-JSON responses (HTML error pages / 404s)
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      if (response.status === 404) {
        throw new Error("API endpoint not found (/api/admin/subscriptions). Please verify your route path.");
      }
      throw new Error(`Server returned HTML (${response.status} ${response.statusText}) instead of JSON.`);
    }

    // 2. Safe to parse as JSON
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || "Failed to fetch subscriptions.");
    }

    setSubscriptions(result.data ?? []);
    setTotalPages(result.pagination?.totalPages ?? 1);
  } catch (err) {
    setSubscriptions([]);
    setError(err instanceof Error ? err.message : "Failed to load subscriptions.");
  } finally {
    setLoading(false);
  }
}, [page, status, search]);

  useEffect(() => {
    fetchSubscriptions();
  }, [page, status]);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    fetchSubscriptions();
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-[1600px] space-y-8">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/60 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                Admin Console
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Subscriptions
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Monitor customer tier plans, transaction logs, and approval statuses.
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#0b132b]/80 p-4 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search by customer name or email address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#070d1e] pl-11 pr-4 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-800 bg-[#070d1e] px-4 py-3 text-sm text-slate-300 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 active:scale-[0.98] shadow-lg shadow-indigo-600/20"
              >
                Filter
              </button>
            </div>
          </form>
        </div>

        {/* ERROR DISPLAY */}
        {error && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 font-bold">
                !
              </div>
              <div>
                <p className="text-sm font-semibold text-rose-300">Data Fetch Warning</p>
                <p className="text-xs text-rose-400/80">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* DATA TABLE CONTAINER */}
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0b132b]/60 shadow-2xl backdrop-blur-xl">
          {loading ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-500" />
              <p className="text-xs font-medium text-slate-400">Loading subscriptions list...</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-[#070d1e] text-slate-500 shadow-inner">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-200">No Subscriptions Found</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">
                We couldn't find any records matching your search queries or filter choices.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="border-b border-slate-800/80 bg-[#070d1e]/80 text-xs font-medium uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Plan Overview</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Payment Info</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Expiration</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/50">
                  {subscriptions.map((subscription) => {
                    const payment = subscription.payments?.[0];
                    const price = Number(subscription.option.price);
                    const discount = Number(subscription.option.discountPercent);
                    const finalPrice = Math.round(price - price * (discount / 100));
                    const statusConfig = statusStyles[subscription.status] ?? {
                      bg: "bg-slate-500/10",
                      text: "text-slate-400",
                      dot: "bg-slate-400",
                      border: "border-slate-500/20",
                    };

                    return (
                      <tr
                        key={subscription.id}
                        className="group transition-colors hover:bg-indigo-500/[0.02]"
                      >
                        {/* USER */}
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                            {subscription.user.name}
                          </div>
                          <div className="text-xs text-slate-500">{subscription.user.email}</div>
                        </td>

                        {/* PLAN */}
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-300">{subscription.plan.name}</div>
                          <div className="text-[11px] font-mono text-slate-500">
                            ID: #{subscription.id}
                          </div>
                        </td>

                        {/* DURATION */}
                        <td className="px-6 py-4">
                          <div className="text-slate-300">
                            {formatDuration(subscription.option.durationDays)}
                          </div>
                          {discount > 0 && (
                            <span className="mt-0.5 inline-block text-[10px] font-bold text-emerald-400">
                              {discount}% OFF Applied
                            </span>
                          )}
                        </td>

                        {/* AMOUNT */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-indigo-400">
                            {finalPrice.toLocaleString()}{" "}
                            <span className="text-[10px] text-indigo-400/70 font-normal">MMK</span>
                          </div>
                        </td>

                        {/* PAYMENT */}
                        <td className="px-6 py-4">
                          {payment ? (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-slate-300">
                                {payment.method}
                              </div>
                              <span
                                className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                                  paymentStatusStyles[payment.status] ??
                                  "text-slate-400 bg-slate-500/10 border-slate-500/20"
                                }`}
                              >
                                {payment.status}
                              </span>
                              {payment.transactionId && (
                                <div className="max-w-[130px] truncate font-mono text-[10px] text-slate-500">
                                  Tx: {payment.transactionId}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">Unpaid / Manual</span>
                          )}
                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                            {subscription.status}
                          </span>
                        </td>

                        {/* END DATE */}
                        <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                          {formatDate(subscription.endDate)}
                        </td>

                        {/* ACTION */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              router.push(`/admin/subscriptions/${subscription.id}`)
                            }
                            className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500 hover:text-white active:scale-95"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {!loading && subscriptions.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-800/60 pt-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-xl border border-slate-800 bg-[#0b132b] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-[#0b132b]"
            >
              <span className="inline-flex items-center gap-1.5"><ChevronLeft size={15} aria-hidden="true" />Previous</span>
            </button>

            <span className="text-xs font-medium text-slate-400">
              Page <span className="text-slate-200">{page}</span> of{" "}
              <span className="text-slate-200">{totalPages}</span>
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-slate-800 bg-[#0b132b] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-[#0b132b]"
            >
              <span className="inline-flex items-center gap-1.5">Next <ChevronRight size={15} aria-hidden="true" /></span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}