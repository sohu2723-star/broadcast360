"use client";

import Link from "next/link";
import { Play } from "lucide-react";

import type { User } from "@/types/user";

interface Props {
  user: User;
}

// =====================================================
// DATE FORMATTER
// =====================================================

function formatDate(date?: string | null) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

// =====================================================
// REMAINING DAYS
// =====================================================

function getRemainingDays(
  expiresAt?: string | null,
) {
  if (!expiresAt) {
    return null;
  }

  const expiration = new Date(
    expiresAt,
  ).getTime();

  const now = Date.now();

  const difference =
    expiration - now;

  if (difference <= 0) {
    return 0;
  }

  return Math.ceil(
    difference /
      (1000 * 60 * 60 * 24),
  );
}

// =====================================================
// COMPONENT
// =====================================================

export default function SubscriptionStatusCard({
  user,
}: Props) {
  const subscription =
    user.subscription;

  // =====================================================
  // PREMIUM ACTIVE
  // =====================================================

  if (
    subscription?.status ===
    "ACTIVE"
  ) {
    const remainingDays =
      getRemainingDays(
        subscription.expiresAt,
      );

    return (
      <section
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-amber-400/20
          bg-gradient-to-br
          from-[#211806]
          via-[#17120a]
          to-[#0d142c]
        "
      >
        {/* GLOW */}

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-72
            w-72
            rounded-full
            bg-amber-400/10
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-24
            -left-24
            h-64
            w-64
            rounded-full
            bg-yellow-500/10
            blur-3xl
          "
        />

        <div className="relative p-6 sm:p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              flex
              flex-col
              gap-6
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div className="flex items-center gap-4">

              {/* CROWN */}

              <div
                className="
                  flex
                  h-16
                  w-16
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-amber-400/20
                  bg-amber-400/10
                  text-3xl
                  shadow-lg
                  shadow-amber-900/20
                "
              >
                👑
              </div>

              {/* TITLE */}

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <h2
                    className="
                      text-xl
                      font-bold
                      text-white
                    "
                  >
                    Premium Member
                  </h2>

                  <span
                    className="
                      rounded-full
                      border
                      border-amber-400/20
                      bg-amber-400/10
                      px-2.5
                      py-1
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-amber-400
                    "
                  >
                    Premium
                  </span>

                </div>

                <p
                  className="
                    mt-1
                    text-sm
                    text-zinc-400
                  "
                >
                  You have full access to
                  FlickScope Premium.
                </p>

              </div>

            </div>

            {/* ACTIVE */}

            <div
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-full
                border
                border-emerald-500/20
                bg-emerald-500/10
                px-3
                py-1.5
                text-xs
                font-semibold
                text-emerald-400
              "
            >
              <span
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-emerald-400
                "
              />

              Active
            </div>

          </div>

          {/* =================================================
              PREMIUM DETAILS
          ================================================= */}

          <div
            className="
              mt-7
              grid
              gap-3
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >

            {/* PLAN */}

            <div
              className="
                rounded-2xl
                border
                border-white/5
                bg-white/[0.03]
                p-4
              "
            >
              <p className="text-xs text-zinc-500">
                Plan
              </p>

              <p className="mt-1 font-semibold text-white">
                {subscription.planName ??
                  "Premium"}
              </p>
            </div>

            {/* DURATION */}

            <div
              className="
                rounded-2xl
                border
                border-white/5
                bg-white/[0.03]
                p-4
              "
            >
              <p className="text-xs text-zinc-500">
                Duration
              </p>

              <p className="mt-1 font-semibold text-white">
                {subscription.durationDays
                  ? `${subscription.durationDays} days`
                  : "—"}
              </p>
            </div>

            {/* START DATE */}

            <div
              className="
                rounded-2xl
                border
                border-white/5
                bg-white/[0.03]
                p-4
              "
            >
              <p className="text-xs text-zinc-500">
                Started
              </p>

              <p className="mt-1 font-semibold text-white">
                {formatDate(
                  subscription.startedAt,
                )}
              </p>
            </div>

            {/* EXPIRES */}

            <div
              className="
                rounded-2xl
                border
                border-amber-400/10
                bg-amber-400/[0.04]
                p-4
              "
            >
              <p className="text-xs text-zinc-500">
                Expires
              </p>

              <p className="mt-1 font-semibold text-amber-400">
                {formatDate(
                  subscription.expiresAt,
                )}
              </p>
            </div>

          </div>

          {/* =================================================
              REMAINING TIME
          ================================================= */}

          {remainingDays !== null && (
            <div
              className="
                mt-4
                rounded-2xl
                border
                border-amber-400/10
                bg-amber-400/[0.04]
                p-5
              "
            >

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-xs text-zinc-500">
                    Premium access remaining
                  </p>

                  <p className="mt-1 text-lg font-bold text-white">

                    {remainingDays === 0
                      ? "Expires today"
                      : `${remainingDays} days remaining`}

                  </p>

                </div>

                <div className="text-2xl">
                  👑
                </div>

              </div>

            </div>
          )}

          {/* =================================================
              BENEFITS
          ================================================= */}

          <div
            className="
              mt-6
              border-t
              border-white/5
              pt-6
            "
          >

            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-zinc-500
              "
            >
              Premium benefits
            </p>

            <div
              className="
                mt-4
                grid
                gap-3
                sm:grid-cols-2
              "
            >

              <Benefit>
                Premium content access
              </Benefit>

              <Benefit>
                Advanced schedule access
              </Benefit>

              <Benefit>
                Program reminders
              </Benefit>

              <Benefit>
                Premium viewing experience
              </Benefit>

            </div>

          </div>

        </div>
      </section>
    );
  }

  // =====================================================
  // PAYMENT PENDING
  // =====================================================

  if (
    subscription?.status ===
    "PENDING"
  ) {
    return (
      <section
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-yellow-500/20
          bg-[#151309]
        "
      >

        <div className="relative p-6 sm:p-8">

          <div className="flex items-center gap-4">

            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-yellow-500/10
                text-2xl
              "
            >
              ⏳
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h2 className="text-xl font-bold text-white">
                  Payment Pending
                </h2>

                <span
                  className="
                    rounded-full
                    bg-yellow-500/10
                    px-2.5
                    py-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-yellow-400
                  "
                >
                  Pending
                </span>

              </div>

              <p className="mt-1 text-sm text-zinc-400">
                Your Premium subscription is
                waiting for payment confirmation.
              </p>

            </div>

          </div>

          {/* PLAN */}

          <div
            className="
              mt-6
              rounded-2xl
              border
              border-yellow-500/10
              bg-yellow-500/5
              p-5
            "
          >

            <p className="text-xs text-zinc-500">
              Selected plan
            </p>

            <p className="mt-1 font-semibold text-white">
              {subscription.planName ??
                "Premium"}
            </p>

            {subscription.durationDays && (
              <p className="mt-1 text-sm text-zinc-500">
                {subscription.durationDays} days
              </p>
            )}

            {subscription.price !== null &&
              subscription.price !== undefined && (
                <p className="mt-3 text-lg font-bold text-yellow-400">
                  {subscription.price.toLocaleString()}{" "}
                  MMK
                </p>
              )}

          </div>

          {/* PAYMENT BUTTON */}

          <Link
            href={`/subscription/payment?subscriptionId=${subscription.id}`}
            className="
              mt-5
              inline-flex
              w-full
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-r
              from-yellow-500
              to-amber-500
              px-5
              py-3
              text-sm
              font-bold
              text-black
              transition
              hover:from-yellow-400
              hover:to-amber-400
            "
          >
            Continue Payment
          </Link>

          <p className="mt-3 text-center text-xs text-zinc-600">
            You already have a pending Premium
            subscription. You cannot create another
            subscription until this one is completed.
          </p>

        </div>
      </section>
    );
  }

  // =====================================================
  // EXPIRED
  // =====================================================

  if (
    subscription?.status ===
    "EXPIRED"
  ) {
    return (
      <section
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-red-500/20
          bg-[#160c10]
        "
      >

        <div className="relative p-6 sm:p-8">

          <div className="flex items-center gap-4">

            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-red-500/10
                text-2xl
              "
            >
              👑
            </div>

            <div>

              <h2 className="text-xl font-bold text-white">
                Premium Expired
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                Your Premium subscription has expired.
              </p>

            </div>

          </div>

          <div
            className="
              mt-6
              rounded-2xl
              border
              border-white/5
              bg-white/[0.03]
              p-5
            "
          >

            <div className="grid gap-4 sm:grid-cols-2">

              <div>

                <p className="text-xs text-zinc-500">
                  Previous plan
                </p>

                <p className="mt-1 font-semibold text-white">
                  {subscription.planName ??
                    "Premium"}
                </p>

              </div>

              <div>

                <p className="text-xs text-zinc-500">
                  Expired
                </p>

                <p className="mt-1 font-semibold text-red-400">
                  {formatDate(
                    subscription.expiresAt,
                  )}
                </p>

              </div>

            </div>

          </div>

          <Link
            href="/subscription"
            className="
              mt-5
              inline-flex
              w-full
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-r
              from-indigo-600
              to-blue-600
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:from-indigo-500
              hover:to-blue-500
            "
          >
            Renew Premium
          </Link>

        </div>
      </section>
    );
  }

  // =====================================================
  // FREE USER
  // =====================================================

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-[#0d142c]
      "
    >

      <div className="relative p-6 sm:p-8">

        <div
          className="
            flex
            flex-col
            gap-6
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div className="flex items-center gap-4">

            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-blue-500/10
                text-blue-200
              "
            >
              <Play size={24} strokeWidth={1.8} aria-hidden="true" />
            </div>

            <div>

              <h2 className="text-xl font-bold text-white">
                Free Account
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                Enjoy the free FlickScope
                experience.
              </p>

            </div>

          </div>

          <Link
            href="/subscription"
            className="
              inline-flex
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-r
              from-indigo-600
              to-blue-600
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:from-indigo-500
              hover:to-blue-500
            "
          >
            Upgrade to Premium
          </Link>

        </div>

      </div>
    </section>
  );
}

// =====================================================
// BENEFIT COMPONENT
// =====================================================

function Benefit({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-zinc-300">

      <span
        className="
          flex
          h-5
          w-5
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-amber-400/10
          text-xs
          text-amber-400
        "
      >
        ✓
      </span>

      {children}

    </div>
  );
}