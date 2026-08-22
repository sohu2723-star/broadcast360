import {
  useEffect,
  useState,
} from "react";

import { useLocation, useParams } from 'wouter';

interface Payment {
  id: number;
  amount: number;
  currency: string;
  method: string;
  transactionId: string | null;
  screenshotUrl: string | null;
  status:
    | "PENDING"
    | "PAID"
    | "REJECTED"
    | "FAILED";
  createdAt: string;

  subscription: {
    id: number;
    status: string;

    user: {
      id: number;
      name: string;
      email: string;
      phone: string | null;
    };

    plan: {
      id: number;
      name: string;
    };

    option: {
      id: number;
      durationDays: number;
      price: number;
      discountPercent: number;
    };
  };
}

export default function PaymentReviewPage() {
  const params = useParams();

  const [, setLocation] = useLocation();

  const id = params.id;

  const [payment, setPayment] =
    useState<Payment | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  async function loadPayment() {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          `/api/payments/${id}`,
          {
            credentials: "include",
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
            "Failed to load payment."
        );
      }

      setPayment(result.data);
    } catch (error) {
      console.error(
        "Failed to load payment:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load payment."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadPayment();
    }
  }, [id]);

  async function updateStatus(
    status:
      | "PAID"
      | "REJECTED"
  ) {
    if (!payment) return;

    try {
      setSaving(true);
      setError("");

      const response =
        await fetch(
          `/api/payments/${payment.id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body: JSON.stringify({
              status,
            }),
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
            "Failed to update payment."
        );
      }

      setPayment(
        (current) =>
          current
            ? {
                ...current,
                status,
              }
            : current
      );
    } catch (error) {
      console.error(
        "Failed to update payment:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update payment."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-500" />

          <p className="mt-4 text-sm text-gray-400">
            Loading payment...
          </p>
        </div>
      </div>
    );
  }

  if (error && !payment) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-white">
        <h2 className="text-lg font-bold text-rose-300">
          Payment Error
        </h2>

        <p className="mt-2 text-sm text-rose-400">
          {error}
        </p>

        <button
          onClick={() =>
            setLocation(
              "/payments"
            )
          }
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold"
        >
          Back to Payments
        </button>
      </div>
    );
  }

  if (!payment) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 text-white">

      {/* HEADER */}

      <div className="rounded-3xl border border-white/10 bg-[#0B1026]/90 p-8 shadow-2xl">

        <button
          onClick={() =>
            setLocation(
              "/payments"
            )
          }
          className="mb-6 text-sm text-gray-400 transition hover:text-white"
        >
          ← Back to Payments
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-xs uppercase tracking-[0.2em] text-indigo-400">
              Payment Review
            </p>

            <h1 className="mt-2 text-3xl font-extrabold">
              Payment #{payment.id}
            </h1>

          </div>

          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold">
            {payment.status}
          </span>

        </div>

      </div>

      {/* CUSTOMER */}

      <div className="rounded-3xl border border-white/10 bg-[#0B1026]/90 p-8 shadow-xl">

        <h2 className="text-lg font-bold">
          Customer
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">

          <div>
            <p className="text-xs text-gray-500">
              Name
            </p>

            <p className="mt-1 font-semibold">
              {payment.subscription.user.name}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Email
            </p>

            <p className="mt-1 font-semibold">
              {payment.subscription.user.email}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Phone
            </p>

            <p className="mt-1 font-semibold">
              {payment.subscription.user.phone ||
                "Not provided"}
            </p>
          </div>

        </div>

      </div>

      {/* PAYMENT */}

      <div className="rounded-3xl border border-white/10 bg-[#0B1026]/90 p-8 shadow-xl">

        <h2 className="text-lg font-bold">
          Payment Information
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">

          <div>
            <p className="text-xs text-gray-500">
              Amount
            </p>

            <p className="mt-1 text-2xl font-bold text-indigo-400">
              {payment.amount.toLocaleString()}{" "}
              {payment.currency}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Payment Method
            </p>

            <p className="mt-1 font-semibold">
              {payment.method}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Transaction ID
            </p>

            <p className="mt-1 break-all font-mono text-sm text-gray-300">
              {payment.transactionId ||
                "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Submitted
            </p>

            <p className="mt-1 font-semibold">
              {new Date(
                payment.createdAt
              ).toLocaleString("en-GB")}
            </p>
          </div>

        </div>

      </div>

      {/* SUBSCRIPTION */}

      <div className="rounded-3xl border border-white/10 bg-[#0B1026]/90 p-8 shadow-xl">

        <h2 className="text-lg font-bold">
          Subscription
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">

          <div>
            <p className="text-xs text-gray-500">
              Plan
            </p>

            <p className="mt-1 font-semibold">
              {payment.subscription.plan.name}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Duration
            </p>

            <p className="mt-1 font-semibold">
              {payment.subscription.option.durationDays}{" "}
              days
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Subscription Status
            </p>

            <p className="mt-1 font-semibold">
              {payment.subscription.status}
            </p>
          </div>

        </div>

      </div>

      {/* SCREENSHOT */}

      {payment.screenshotUrl && (
        <div className="rounded-3xl border border-white/10 bg-[#0B1026]/90 p-8 shadow-xl">

          <h2 className="text-lg font-bold">
            Payment Screenshot
          </h2>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/20">

            <img
              src={
                payment.screenshotUrl
              }
              alt="Payment screenshot"
              className="max-h-[700px] w-full object-contain"
            />

          </div>

        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* ACTIONS */}

      {payment.status ===
        "PENDING" && (

        <div className="flex flex-col gap-3 sm:flex-row">

          <button
            disabled={saving}
            onClick={() =>
              updateStatus("PAID")
            }
            className="flex-1 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving
              ? "Updating..."
              : "✓ Approve Payment"}
          </button>

          <button
            disabled={saving}
            onClick={() =>
              updateStatus(
                "REJECTED"
              )
            }
            className="flex-1 rounded-xl bg-rose-600 py-3.5 text-sm font-semibold transition hover:bg-rose-500 disabled:opacity-50"
          >
            {saving
              ? "Updating..."
              : "✕ Reject Payment"}
          </button>

        </div>

      )}

    </div>
  );
}