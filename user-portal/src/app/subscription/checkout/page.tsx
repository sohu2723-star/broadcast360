"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import authApi from "@/lib/authapi";

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

  plan?: {
    id: number;
    name: string;
  };
}

interface ApiResponse {
  success: boolean;
  option: SubscriptionOption;
}

// =====================================================
// PAGE
// =====================================================

export default function CheckoutPage() {
  const searchParams = useSearchParams();

  const optionId = searchParams.get("optionId");

  const [option, setOption] =
    useState<SubscriptionOption | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  // =====================================================
  // FETCH OPTION
  // =====================================================

  useEffect(() => {
    if (!optionId) {
      setError(
        "Subscription option not selected."
      );

      setLoading(false);

      return;
    }

    async function fetchOption() {
      try {
        setLoading(true);
        setError("");

        const response =
          await authApi.get<ApiResponse>(
            `/api/user-portal/auth/subscription-options/${optionId}`
          );

        if (
          !response.data?.success ||
          !response.data?.option
        ) {
          throw new Error(
            "Subscription option not found."
          );
        }

        setOption(response.data.option);
      } catch (err) {
        console.error(
          "Failed to load subscription option:",
          err
        );

        setOption(null);

        setError(
          "Failed to load subscription option."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOption();
  }, [optionId]);

  // =====================================================
  // CONFIRM SUBSCRIPTION
  // =====================================================

  async function handleConfirmSubscription() {
  if (!option) {
    return;
  }

  try {
    setSubmitting(true);
    setError("");

    const response = await authApi.post(
      "/api/user-portal/auth/subscriptions",
      {
        optionId: option.id,
      }
    );

    const data = response.data;

    // =================================================
    // ALREADY ACTIVE / PREMIUM
    // =================================================

    if (data?.alreadySubscribed) {
      setError(
        data.message ||
          "You are already subscribed to the Premium plan."
      );

      return;
    }

    // =================================================
    // PAYMENT ALREADY PENDING
    // =================================================

    if (data?.paymentPending) {
      setError(
        data.message ||
          "Your payment is already pending review."
      );

      return;
    }

    // =================================================
    // PAYMENT ALREADY COMPLETED
    // =================================================

    if (data?.paymentCompleted) {
      setError(
        data.message ||
          "Your payment has already been submitted and is waiting for review."
      );

      return;
    }

    // =================================================
    // SUBSCRIPTION ID
    // =================================================

    const subscriptionId =
      data?.subscriptionId;

    if (!subscriptionId) {
      throw new Error(
        "Subscription ID was not returned."
      );
    }

    // =================================================
    // PAYMENT REQUIRED
    // =================================================

    if (
      data?.paymentRequired === true
    ) {
      window.location.href =
        `/subscription/payment?subscriptionId=${subscriptionId}`;

      return;
    }

    // =================================================
    // SAFETY FALLBACK
    // =================================================

    if (
      data?.subscription?.status ===
      "PENDING"
    ) {
      window.location.href =
        `/subscription/payment?subscriptionId=${subscriptionId}`;

      return;
    }

    setError(
      "This subscription cannot proceed to payment."
    );

  } catch (err: any) {

    console.error(
      "Subscription creation failed:",
      err
    );

    // =================================================
    // ALREADY PREMIUM
    // =================================================

    if (
      err?.response?.status === 409 &&
      err?.response?.data?.alreadySubscribed
    ) {
      setError(
        err.response.data.message ||
          "You are already subscribed to the Premium plan."
      );

      return;
    }

    // =================================================
    // PAYMENT ALREADY PENDING
    // =================================================

    if (
      err?.response?.status === 409 &&
      err?.response?.data?.paymentPending
    ) {
      setError(
        err.response.data.message ||
          "Your payment is already pending review."
      );

      return;
    }

    // =================================================
    // PAYMENT ALREADY COMPLETED
    // =================================================

    if (
      err?.response?.status === 409 &&
      err?.response?.data?.paymentCompleted
    ) {
      setError(
        err.response.data.message ||
          "Your payment has already been submitted."
      );

      return;
    }

    setError(
      err?.response?.data?.message ||
        "Failed to create subscription."
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
        <p className="text-sm text-zinc-400">
          Loading checkout...
        </p>
      </div>
    );
  }

  // =====================================================
  // ERROR / NOT FOUND
  // =====================================================

  if (error || !option) {
    return (
      <div className="min-h-screen bg-[#010312] px-6 py-16 text-white">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
            !
          </div>

          <h1 className="mt-6 text-2xl font-bold">
            Checkout unavailable
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            {error ||
              "Subscription option not found."}
          </p>

          <Link
            href="/subscription"
            className="
              mt-6
              inline-flex
              items-center
              justify-center
              rounded-xl
              bg-indigo-600
              px-6
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-indigo-500
            "
          >
            Back to Subscriptions
          </Link>
        </div>
      </div>
    );
  }

  // =====================================================
  // PRICE CALCULATION
  // =====================================================

  const price = Number(option.price);

  const discount = Number(
    option.discountPercent
  );

  const discountAmount =
    price * (discount / 100);

  const finalPrice =
    price - discountAmount;

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

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <Link
            href="/subscription"
            className="
              text-sm
              text-zinc-500
              transition
              hover:text-white
            "
          >
            ← Back to subscriptions
          </Link>

          <p className="mt-8 text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
            Checkout
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Confirm Your Subscription
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            Review your subscription before
            continuing.
          </p>

        </div>

        {/* =================================================
            CHECKOUT CARD
        ================================================= */}

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d142c]">

          {/* =================================================
              PLAN HEADER
          ================================================= */}

          <div className="border-b border-white/10 p-6 sm:p-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm text-indigo-400">
                  Subscription Plan
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {option.plan?.name ??
                    "Premium"}
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  {durationLabel}
                </p>

              </div>

              <div className="rounded-2xl border border-indigo-500/10 bg-indigo-500/10 px-5 py-4 text-center">

                <p className="text-xs text-zinc-500">
                  Duration
                </p>

                <p className="mt-1 font-bold text-indigo-400">
                  {option.durationDays} days
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              PRICE
          ================================================= */}

          <div className="p-6 sm:p-8">

            <div className="space-y-4">

              {/* ORIGINAL PRICE */}

              <div className="flex items-center justify-between text-sm">

                <span className="text-zinc-400">
                  Original Price
                </span>

                <span className="font-medium text-white">
                  {price.toLocaleString()} MMK
                </span>

              </div>

              {/* DISCOUNT */}

              <div className="flex items-center justify-between text-sm">

                <span className="text-zinc-400">
                  Discount
                </span>

                <span className="font-medium text-emerald-400">
                  {discount}%
                </span>

              </div>

              {/* DISCOUNT AMOUNT */}

              {discount > 0 && (
                <div className="flex items-center justify-between text-sm">

                  <span className="text-zinc-400">
                    Discount Amount
                  </span>

                  <span className="font-medium text-emerald-400">
                    -
                    {discountAmount.toLocaleString()}{" "}
                    MMK
                  </span>

                </div>
              )}

              {/* TOTAL */}

              <div className="border-t border-white/10 pt-5">

                <div className="flex items-end justify-between gap-4">

                  <div>

                    <p className="text-sm text-zinc-500">
                      Total
                    </p>

                    <p className="mt-1 text-3xl font-bold">
                      {finalPrice.toLocaleString()}{" "}
                      MMK
                    </p>

                  </div>

                  <span className="text-sm text-zinc-500">
                    {durationLabel}
                  </span>

                </div>

              </div>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* =================================================
                CONFIRM
            ================================================= */}

            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirmSubscription}
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
              {submitting
                ? "Processing..."
                : "Confirm Subscription"}
            </button>

            <p className="mt-4 text-center text-xs text-zinc-600">
              Your subscription will be created
              after confirmation.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}