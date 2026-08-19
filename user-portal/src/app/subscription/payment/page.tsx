"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import authApi from "@/lib/authapi";

// =====================================================
// KPAY CONFIGURATION (Replace with your actual details)
// =====================================================
const KPAY_NUMBER = "09678881407"; 
const KPAY_ACCOUNT_NAME = "Daw Sandar Kyaw"; 
const KPAY_QR_IMAGE_PATH = "/images/kpay_qr.jpg"; 

// =====================================================
// TYPES
// =====================================================

interface SubscriptionOption {
  id: number;
  planId: number;
  durationDays: number;
  price: number | string;
  discountPercent: number | string;
  isActive: boolean;
}

interface Subscription {
  id: number;
  userId: number;
  planId: number;
  optionId: number;
  status: string;
  startDate: string | null;
  endDate: string | null;

  option: SubscriptionOption;

  plan: {
    id: number;
    name: string;
    description?: string | null;
  };
}

interface ApiResponse {
  success: boolean;
  subscription: Subscription;
}

// =====================================================
// PAGE
// =====================================================

function PaymentContent() {
  const searchParams = useSearchParams();

  const subscriptionId = searchParams.get("subscriptionId");

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // COPY HANDLER
  // =====================================================

  function copyToClipboard() {
    navigator.clipboard.writeText(KPAY_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // =====================================================
  // LOAD SUBSCRIPTION
  // =====================================================

  useEffect(() => {
    if (!subscriptionId) {
      setError("Subscription is missing.");
      setLoading(false);
      return;
    }

    async function fetchSubscription() {
      try {
        setLoading(true);
        setError("");

        const response = await authApi.get<ApiResponse>(
          `/api/user-portal/auth/subscriptions/${subscriptionId}`
        );

        if (!response.data?.success || !response.data?.subscription) {
          throw new Error("Subscription not found.");
        }

        const loadedSubscription = response.data.subscription;

        setSubscription(loadedSubscription);

        if (loadedSubscription.status !== "PENDING") {
          setError(
            loadedSubscription.status === "ACTIVE"
              ? "This subscription is already active."
              : `This subscription cannot accept payment because its status is ${loadedSubscription.status}.`
          );
        }
      } catch (err) {
        console.error("Failed to load subscription:", err);

        setSubscription(null);

        setError("Failed to load subscription.");
      } {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [subscriptionId]);

  // =====================================================
  // SCREENSHOT CHANGE
  // =====================================================

  function handleScreenshotChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Screenshot must be smaller than 5MB.");

      event.target.value = "";
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const imageUrl = URL.createObjectURL(file);

    setScreenshot(file);
    setPreview(imageUrl);
  }

  // =====================================================
  // REMOVE SCREENSHOT
  // =====================================================

  function removeScreenshot() {
    setScreenshot(null);

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview("");
    setError("");
    setSuccess("");
  }

  // =====================================================
  // SUBMIT PAYMENT
  // =====================================================

  async function submitPayment() {
    if (!subscriptionId) {
      setError("Subscription is missing.");
      return;
    }

    if (!subscription) {
      setError("Subscription is missing.");
      return;
    }

    if (subscription.status !== "PENDING") {
      setError(
        `This subscription cannot accept payment because its status is ${subscription.status}.`
      );
      return;
    }

    if (!screenshot) {
      setError("Please upload your KPay payment screenshot.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("subscriptionId", subscriptionId);
      formData.append("screenshot", screenshot);

      const response = await authApi.post(
        "/api/user-portal/auth/payments",
        formData
      );

      console.log("PAYMENT RESPONSE:", response.data);

      setSuccess(
        "Payment submitted successfully. Your payment is waiting for verification."
      );

      setScreenshot(null);

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      setPreview("");

      // Prevent another submission
      setSubscription((current) =>
        current
          ? {
              ...current,
              status: "PAYMENT_PENDING",
            }
          : current
      );
    } catch (err: any) {
      console.error("Payment submission failed:", err);

      setError(
        err?.response?.data?.message ?? "Payment submission failed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#010312] text-white">
        <p className="text-sm text-zinc-400">Loading payment...</p>
      </div>
    );
  }

  // =====================================================
  // ERROR / NOT FOUND
  // =====================================================

  if (!subscription) {
    return (
      <div className="min-h-screen bg-[#010312] px-6 py-16 text-white">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-2xl font-bold">Payment unavailable</h1>

          <p className="mt-3 text-zinc-400">
            {error || "Subscription not found."}
          </p>

          <Link
            href="/subscription"
            className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold hover:bg-indigo-500"
          >
            Back to Subscriptions
          </Link>
        </div>
      </div>
    );
  }

  // =====================================================
  // SUBSCRIPTION DATA
  // =====================================================

  const option = subscription.option;
  const plan = subscription.plan;

  // =====================================================
  // PRICE
  // =====================================================

  const price = Number(option.price);
  const discount = Number(option.discountPercent);
  const discountAmount = price * (discount / 100);
  const finalPrice = price - discountAmount;

  // =====================================================
  // DURATION
  // =====================================================

  const durationLabel =
    option.durationDays === 30
      ? "1 Month"
      : option.durationDays === 90
      ? "3 Months"
      : option.durationDays === 180
      ? "6 Months"
      : option.durationDays === 365
      ? "1 Year"
      : `${option.durationDays} Days`;

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-[#010312] px-5 py-12 text-white sm:px-8">
      <main className="mx-auto max-w-3xl">
        {/* HEADER */}

        <div className="mb-8">
          <Link
            href={`/subscription/checkout?optionId=${option.id}`}
            className="text-sm text-zinc-500 transition hover:text-white"
          >
            ← Back to checkout
          </Link>

          <p className="mt-8 text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
            Payment
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Complete Your Payment
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Scan the QR code or transfer to the KPay number below, then upload
            your payment screenshot.
          </p>
        </div>

        {/* PLAN CARD */}

        <section className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0d142c]">
          <div className="border-b border-white/10 p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-indigo-400">Subscription Plan</p>

                <h2 className="mt-2 text-2xl font-bold">{plan.name}</h2>

                <p className="mt-1 text-sm text-zinc-500">{durationLabel}</p>
              </div>

              <div className="rounded-2xl bg-indigo-500/10 px-5 py-4 sm:text-right">
                <p className="text-xs text-zinc-500">Total Amount</p>

                <p className="mt-1 text-2xl font-bold text-indigo-400">
                  {finalPrice.toLocaleString()} MMK
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PAYMENT CARD */}

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d142c]">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold">KPay Payment Details</h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Transfer exact amount via KBZPay application and keep your transaction record screenshot.
            </p>

            {/* PAYMENT INFORMATION & QR DISPLAY */}

            <div className="mt-6 grid gap-6 sm:grid-cols-1 md:grid-cols-12">
              {/* LEFT COLUMN: ACCOUNT DETAILS */}
              <div className="flex flex-col justify-between rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 md:col-span-7">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-600/30">
                      K
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        KBZPay (KPay)
                      </p>
                      <p className="text-xs text-zinc-400">
                        Personal / Merchant Transfer
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Account Name
                      </p>
                      <p className="mt-1 text-base font-semibold text-white">
                        {KPAY_ACCOUNT_NAME}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                        KPay Phone Number
                      </p>

                      <div className="mt-1.5 flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5">
                        <span className="font-mono text-base font-bold tracking-wide text-indigo-300">
                          {KPAY_NUMBER}
                        </span>

                        <button
                          type="button"
                          onClick={copyToClipboard}
                          className="rounded-lg bg-indigo-600/30 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-600 hover:text-white"
                        >
                          {copied ? "Copied! ✓" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4">
                  <p className="text-xs uppercase tracking-wider text-zinc-400">
                    Amount to Pay
                  </p>
                  <p className="mt-1 text-2xl font-bold text-indigo-400">
                    {finalPrice.toLocaleString()} MMK
                  </p>
                </div>
              </div>

              {/* RIGHT COLUMN: QR CODE DISPLAY */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/30 p-5 text-center md:col-span-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Scan QR Code
                </p>

                <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-white p-3 shadow-lg shadow-indigo-500/10">
                  <img
                    src={KPAY_QR_IMAGE_PATH}
                    alt="KPay QR Code"
                    className="h-40 w-40 object-contain sm:h-44 sm:w-44"
                  />
                </div>

                <p className="mt-3 text-xs text-zinc-400">
                  Open KBZPay App & Scan
                </p>
              </div>
            </div>

            {/* SCREENSHOT UPLOAD */}

            <div className="mt-8">
              <div className="flex items-end justify-between">
                <div>
                  <label className="text-sm font-semibold text-white">
                    Payment Screenshot
                  </label>

                  <p className="mt-1 text-xs text-zinc-400">
                    Upload the KPay transaction screenshot.
                  </p>
                </div>

                <span className="text-xs text-zinc-500">Max 5MB</span>
              </div>

              {!preview ? (
                <label
                  htmlFor="payment-screenshot"
                  className="
                    mt-4
                    flex
                    min-h-56
                    cursor-pointer
                    flex-col
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-dashed
                    border-white/20
                    bg-white/[0.02]
                    px-6
                    py-10
                    text-center
                    transition
                    hover:border-indigo-500/50
                    hover:bg-indigo-500/[0.04]
                  "
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-3xl">
                    📷
                  </div>

                  <p className="mt-4 font-semibold">Upload KPay Screenshot</p>

                  <p className="mt-2 text-xs text-zinc-500">
                    PNG, JPG or JPEG
                  </p>

                  <input
                    id="payment-screenshot"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleScreenshotChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold">
                        Screenshot Preview
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {screenshot?.name}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={removeScreenshot}
                      className="rounded-lg px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex justify-center p-5">
                    <img
                      src={preview}
                      alt="KPay payment screenshot"
                      className="max-h-[500px] max-w-full rounded-xl object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* OCR NOTICE */}

            <div className="mt-5 flex gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <div className="text-lg">🔍</div>

              <div>
                <p className="text-sm font-semibold text-blue-400">
                  Automatic Transaction Detection
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  You don't need to type your transaction ID manually. The system will read the transaction details directly from your screenshot.
                </p>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-400">
                <div className="flex gap-3">
                  <span className="text-lg">✓</span>

                  <div>
                    <p className="font-semibold">Payment Submitted</p>

                    <p className="mt-1 text-xs leading-5 text-emerald-400/80">
                      {success}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="button"
              onClick={submitPayment}
              disabled={submitting || !screenshot}
              className="
                mt-8
                w-full
                rounded-xl
                bg-gradient-to-r
                from-indigo-600
                to-blue-600
                px-6
                py-4
                text-sm
                font-bold
                text-white
                shadow-lg
                shadow-indigo-600/20
                transition
                hover:from-indigo-500
                hover:to-blue-500
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {submitting ? "Processing Payment..." : "Submit Payment"}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-zinc-500">
              Your payment will be marked as{" "}
              <span className="font-semibold text-yellow-500">
                Pending Verification
              </span>{" "}
              until reviewed by the administrator.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}


export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#010312] text-white">
          <p className="text-sm text-zinc-400">Loading payment...</p>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
