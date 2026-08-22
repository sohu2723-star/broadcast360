import { use, useEffect, useState } from "react";
import { useLocation , useParams } from 'wouter';

interface Payment {
  id: number;
  amount: number;
  currency: string;
  method: string;
  transactionId: string | null;
  screenshotUrl: string | null;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

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
    price: number;
    discountPercent: number;
  };

  payments: Payment[];
}

interface Props {
  params: Promise<{
    id: string;
  }>;
}

function formatDate(date: string | null) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: string | null) {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(days: number) {
  if (days === 30) return "1 Month";
  if (days === 90) return "3 Months";
  if (days === 180) return "6 Months";
  if (days === 365) return "1 Year";

  return `${days} Days`;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  EXPIRED: "bg-slate-800 text-slate-400 border border-slate-700",
  CANCELLED: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
};

export default function SubscriptionDetailPage() {
  const params = useParams();

  const { id } = params;
  const [, setLocation] = useLocation();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function fetchSubscription() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/subscriptions/${id}`);
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      if (!response.ok) {
        if (isJson) {
          const result = await response.json();
          throw new Error(result.error || "Failed to fetch subscription");
        } else {
          throw new Error(`HTTP ${response.status}: Route not found or server error`);
        }
      }

      if (!isJson) {
        throw new Error("Server did not return valid JSON data.");
      }

      const result = await response.json();
      setSubscription(result);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Failed to load subscription"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubscription();
  }, [id]);

  async function handleApprove() {
    if (!subscription) return;

    const confirmed = window.confirm(
      "Are you sure you want to approve this payment?"
    );
    if (!confirmed) return;

    try {
      setProcessing(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/subscriptions/${subscription.id}/approve`,
        { method: "POST" }
      );
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      if (!response.ok) {
        if (isJson) {
          const result = await response.json();
          throw new Error(result.error || "Failed to approve payment");
        } else {
          throw new Error(`HTTP ${response.status}: Failed to approve payment`);
        }
      }

      setMessage(
        "Payment approved successfully. Subscription is now active."
      );
      await fetchSubscription();
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Failed to approve payment"
      );
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    if (!subscription) return;

    const confirmed = window.confirm(
      "Are you sure you want to reject this payment?"
    );
    if (!confirmed) return;

    try {
      setProcessing(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/subscriptions/${subscription.id}/reject`,
        { method: "POST" }
      );
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      if (!response.ok) {
        if (isJson) {
          const result = await response.json();
          throw new Error(result.error || "Failed to reject payment");
        } else {
          throw new Error(`HTTP ${response.status}: Failed to reject payment`);
        }
      }

      setMessage("Payment rejected successfully.");
      await fetchSubscription();
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Failed to reject payment"
      );
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-10 text-center text-slate-400 backdrop-blur-sm">
          Loading subscription...
        </div>
      </div>
    );
  }

  if (error && !subscription) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 space-y-4 text-slate-100">
        <button
          onClick={() => window.history.back()}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Back
        </button>

        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
          {error}
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-slate-400">
        Subscription not found.
      </div>
    );
  }

  const payment = subscription.payments?.[0];
  const canReview =
    subscription.status === "PENDING" && payment?.status === "PENDING";

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => window.history.back()}
            className="mb-3 text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Back to subscriptions
          </button>

          <h1 className="text-2xl font-semibold text-white">
            Subscription #{subscription.id}
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Review subscription and payment information.
          </p>
        </div>

        <span
          className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider ${
            statusStyles[subscription.status] ||
            "bg-slate-800 text-slate-300 border border-slate-700"
          }`}
        >
          {subscription.status}
        </span>
      </div>

      {/* Messages */}
      {message && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      {/* User + Subscription */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <h2 className="mb-5 text-lg font-semibold text-white">User</h2>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400">Name</p>
              <p className="mt-1 font-medium text-slate-200">
                {subscription.user.name}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Email</p>
              <p className="mt-1 text-slate-200">{subscription.user.email}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400">User ID</p>
              <p className="mt-1 text-slate-200">{subscription.user.id}</p>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <h2 className="mb-5 text-lg font-semibold text-white">
            Subscription
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Plan</span>
              <span className="font-medium text-slate-200">
                {subscription.plan.name}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Duration</span>
              <span className="font-medium text-slate-200">
                {formatDuration(subscription.option.durationDays)}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Discount</span>
              <span className="font-medium text-emerald-400">
                {subscription.option.discountPercent}%
              </span>
            </div>

            <div className="flex justify-between gap-4 border-t border-slate-800 pt-4">
              <span className="text-slate-400">Amount</span>
              <span className="text-lg font-semibold text-white">
                {Number(subscription.option.price).toLocaleString()} MMK
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <h2 className="mb-5 text-lg font-semibold text-white">
          Subscription Period
        </h2>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-400">Created</p>
            <p className="mt-1 font-medium text-slate-200">
              {formatDateTime(subscription.createdAt)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Start Date</p>
            <p className="mt-1 font-medium text-slate-200">
              {formatDate(subscription.startDate)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">End Date</p>
            <p className="mt-1 font-medium text-slate-200">
              {formatDate(subscription.endDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Payment</h2>

          {payment && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                payment.status === "PAID"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : payment.status === "PENDING"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {payment.status}
            </span>
          )}
        </div>

        {!payment ? (
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-6 text-center text-sm text-slate-400">
            No payment has been submitted yet.
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Payment information */}
            <div className="space-y-5">
              <div>
                <p className="text-xs text-slate-400">Payment ID</p>
                <p className="mt-1 font-medium text-slate-200">#{payment.id}</p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Method</p>
                <p className="mt-1 font-medium text-slate-200">
                  {payment.method}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Transaction ID</p>
                <p className="mt-1 font-medium text-slate-200">
                  {payment.transactionId || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Amount</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {Number(payment.amount).toLocaleString()} {payment.currency}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Submitted</p>
                <p className="mt-1 text-slate-200">
                  {formatDateTime(payment.createdAt)}
                </p>
              </div>

              {payment.paidAt && (
                <div>
                  <p className="text-xs text-slate-400">Paid At</p>
                  <p className="mt-1 text-slate-200">
                    {formatDateTime(payment.paidAt)}
                  </p>
                </div>
              )}
            </div>

            {/* Screenshot */}
            <div>
              <p className="mb-3 text-xs text-slate-400">Payment Screenshot</p>

              {payment.screenshotUrl ? (
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50 p-2">
                  <img
                    src={payment.screenshotUrl}
                    alt="Payment screenshot"
                    className="max-h-[500px] w-full object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/50 text-sm text-slate-500">
                  No screenshot uploaded.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {canReview && (
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-800 pt-6">
            <button
              type="button"
              disabled={processing}
              onClick={handleReject}
              className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-5 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {processing ? "Processing..." : "Reject Payment"}
            </button>

            <button
              type="button"
              disabled={processing}
              onClick={handleApprove}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-lg shadow-emerald-950/50"
            >
              {processing ? "Processing..." : "Approve Payment"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}