"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

// =====================================================
// TYPES
// =====================================================

type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "REJECTED"
  | "FAILED";

interface Payment {
  id: number;

  amount: number | string;

  currency: string;

  method: string;

  transactionId: string | null;

  screenshotUrl: string | null;

  status: PaymentStatus;

  createdAt: string;

  subscription: {
    id: number;

    status: string;

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
  };
}

interface ApiResponse {
  success: boolean;

  data: Payment[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  message?: string;
}

// =====================================================
// STATUS
// =====================================================

const paymentStatusStyles: Record<
  PaymentStatus,
  {
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  PENDING: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
  },

  PAID: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
  },

  REJECTED: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
    dot: "bg-rose-400",
  },

  FAILED: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    dot: "bg-red-500",
  },
};

// =====================================================
// HELPERS
// =====================================================

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function formatDuration(days: number) {
  if (days === 30) return "1 Month";

  if (days === 90) return "3 Months";

  if (days === 180) return "6 Months";

  if (days === 365) return "1 Year";

  return `${days} Days`;
}

// =====================================================
// PAGE
// =====================================================

export default function PaymentsPage() {
  const router = useRouter();

  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(1);

  const limit = 10;

  // ===================================================
  // FETCH
  // ===================================================

  const fetchPayments = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });

        if (search.trim()) {
          params.set(
            "search",
            search.trim()
          );
        }

        if (status) {
          params.set(
            "status",
            status
          );
        }

        const response =
          await fetch(
            `/api/payments?${params.toString()}`,
            {
              method: "GET",

              credentials:
                "include",

              cache: "no-store",
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to load payments."
          );
        }

        const data =
          result as ApiResponse;

        setPayments(
          data.data ?? []
        );

        setTotal(
          data.pagination?.total ?? 0
        );

        setTotalPages(
          data.pagination?.totalPages ?? 1
        );
      } catch (error) {
        console.error(
          "Failed to fetch payments:",
          error
        );

        setPayments([]);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load payments."
        );
      } finally {
        setLoading(false);
      }
    },
    [page, search, status]
  );

  // ===================================================
  // LOAD
  // ===================================================

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // ===================================================
  // SEARCH
  // ===================================================

  function handleSearch(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setPage(1);

    setSearch(
      searchInput.trim()
    );
  }

  // ===================================================
  // STATUS
  // ===================================================

  function handleStatusChange(
    value: string
  ) {
    setStatus(value);

    setPage(1);
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 text-white">

      {/* HEADER */}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0B1026]/90 p-8 shadow-2xl backdrop-blur-xl">

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="flex items-center gap-2">

              <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
                Admin Console
              </p>

            </div>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Payments
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Review customer payment
              submissions and manage
              subscription payments.
            </p>

          </div>

          {/* TOTAL */}

          <div className="rounded-2xl border border-white/10 bg-[#111936]/80 px-6 py-4">

            <p className="text-xs uppercase tracking-wider text-gray-500">
              Total Payments
            </p>

            <p className="mt-1 text-2xl font-bold">
              {total.toLocaleString()}
            </p>

          </div>

        </div>

      </div>

      {/* FILTER */}

      <div className="rounded-2xl border border-white/10 bg-[#0B1026]/90 p-5 shadow-xl backdrop-blur-xl">

        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 lg:flex-row"
        >

          <input
            type="text"
            value={searchInput}
            onChange={(e) =>
              setSearchInput(
                e.target.value
              )
            }
            placeholder="Search customer, email or transaction ID..."
            className="flex-1 rounded-xl border border-white/10 bg-[#070D1E] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-indigo-500"
          />

          <select
            value={status}
            onChange={(e) =>
              handleStatusChange(
                e.target.value
              )
            }
            className="rounded-xl border border-white/10 bg-[#070D1E] px-4 py-3 text-sm text-gray-300 outline-none"
          >

            <option value="">
              All Payment Statuses
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="PAID">
              Paid
            </option>

            <option value="REJECTED">
              Rejected
            </option>

            <option value="FAILED">
              Failed
            </option>

          </select>

          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3 text-sm font-semibold shadow-lg transition hover:from-blue-500 hover:to-indigo-500"
          >
            Search
          </button>

        </form>

      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5">

          <p className="text-sm font-semibold text-rose-300">
            Payment Data Error
          </p>

          <p className="mt-1 text-xs text-rose-400/80">
            {error}
          </p>

        </div>
      )}

      {/* TABLE */}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0B1026]/90 shadow-2xl backdrop-blur-xl">

        {loading ? (

          <div className="flex min-h-[420px] flex-col items-center justify-center gap-4">

            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-500" />

            <p className="text-sm text-gray-400">
              Loading payments...
            </p>

          </div>

        ) : payments.length === 0 ? (

          <div className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#070D1E] text-2xl">
              💳
            </div>

            <h3 className="mt-4 text-base font-semibold text-gray-200">
              No Payments Found
            </h3>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1200px] text-left text-sm">

              <thead className="border-b border-white/10 bg-[#070D1E]/80 text-xs uppercase tracking-wider text-gray-500">

                <tr>

                  <th className="px-6 py-4">
                    Customer
                  </th>

                  <th className="px-6 py-4">
                    Subscription
                  </th>

                  <th className="px-6 py-4">
                    Amount
                  </th>

                  <th className="px-6 py-4">
                    Method
                  </th>

                  <th className="px-6 py-4">
                    Transaction
                  </th>

                  <th className="px-6 py-4">
                    Submitted
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-white/5">

                {payments.map(
                  (payment) => {

                    const config =
                      paymentStatusStyles[
                        payment.status
                      ];

                    return (

                      <tr
                        key={payment.id}
                        className="transition hover:bg-indigo-500/[0.03]"
                      >

                        <td className="px-6 py-5">

                          <p className="font-semibold text-gray-200">
                            {
                              payment
                                .subscription
                                .user.name
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {
                              payment
                                .subscription
                                .user.email
                            }
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <p className="font-medium text-gray-300">
                            {
                              payment
                                .subscription
                                .plan.name
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {formatDuration(
                              payment
                                .subscription
                                .option
                                .durationDays
                            )}
                          </p>

                          <p className="mt-1 font-mono text-[10px] text-gray-600">
                            Subscription #
                            {
                              payment
                                .subscription
                                .id
                            }
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <p className="font-bold text-indigo-400">
                            {Number(
                              payment.amount
                            ).toLocaleString()}
                          </p>

                          <p className="text-[10px] text-gray-500">
                            {payment.currency}
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300">
                            {payment.method}
                          </span>

                        </td>

                        <td className="px-6 py-5">

                          {payment.transactionId ? (

                            <span
                              className="block max-w-[180px] truncate font-mono text-xs text-gray-400"
                              title={
                                payment.transactionId
                              }
                            >
                              {
                                payment.transactionId
                              }
                            </span>

                          ) : (

                            <span className="text-xs italic text-gray-600">
                              Not detected
                            </span>

                          )}

                        </td>

                        <td className="px-6 py-5">

                          <p className="text-xs text-gray-300">
                            {formatDate(
                              payment.createdAt
                            )}
                          </p>

                          <p className="mt-1 text-[10px] text-gray-600">
                            {formatDateTime(
                              payment.createdAt
                            )}
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${config.bg} ${config.text} ${config.border}`}
                          >

                            <span
                              className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                            />

                            {payment.status}

                          </span>

                        </td>

                        <td className="px-6 py-5 text-right">

                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/admin/payments/${payment.id}`
                              )
                            }
                            className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500 hover:text-white"
                          >
                            Review
                          </button>

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* PAGINATION */}

      {!loading &&
        payments.length > 0 && (

          <div className="flex items-center justify-between pt-2">

            <button
              disabled={page <= 1}
              onClick={() =>
                setPage(
                  (p) => p - 1
                )
              }
              className="rounded-xl border border-white/10 bg-[#0B1026] px-5 py-2.5 text-xs font-semibold text-gray-300 disabled:opacity-30"
            >
              ← Previous
            </button>

            <span className="text-xs text-gray-400">
              Page{" "}
              <span className="font-semibold text-white">
                {page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-white">
                {totalPages}
              </span>
            </span>

            <button
              disabled={
                page >= totalPages
              }
              onClick={() =>
                setPage(
                  (p) => p + 1
                )
              }
              className="rounded-xl border border-white/10 bg-[#0B1026] px-5 py-2.5 text-xs font-semibold text-gray-300 disabled:opacity-30"
            >
              Next →
            </button>

          </div>

        )}

    </div>
  );
}