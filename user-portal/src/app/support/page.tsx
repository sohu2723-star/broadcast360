"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import authApi from "@/lib/authapi";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Headphones,
  Sparkles,
  Lock,
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  Globe2,
  ExternalLink,
} from "lucide-react";

interface SupportAccessResponse {
  success: boolean;
  isPremium?: boolean;
  message?: string;
  userId?: number;
  plan?: { id: number; name: string };
}

export default function SupportPage() {
  const router = useRouter();

  // Support Auth & Access States
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSupportAccess() {
      try {
        setLoading(true);
        setError("");
        setIsUnauthorized(false);

        const response = await authApi.get<SupportAccessResponse>(
          "/api/user-portal/auth/support"
        );

        setIsPremium(response.data.isPremium === true);
      } catch (err: any) {
        console.error("Failed to load support access:", err);

        const status = err?.response?.status;

        if (status === 401) {
          setIsUnauthorized(true);
          setError("You need to be logged in to access customer support.");
          return;
        }

        setError(err?.response?.data?.message ?? "Failed to load support.");
      } finally {
        setLoading(false);
      }
    }

    fetchSupportAccess();
  }, [router]);

  /* =========================================
     1. LOADING STATE
  ========================================= */
  if (loading) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6 py-12">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#0B1026]/80 p-12 shadow-2xl backdrop-blur-2xl">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="absolute h-full w-full animate-ping rounded-full bg-blue-500/20" />
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
          </div>
          <p className="mt-5 text-sm font-medium text-slate-400">
            Verifying support credentials...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================
     2. 401 UNAUTHORIZED STATE
  ========================================= */
  if (isUnauthorized) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-6 py-16">
        <div className="w-full rounded-3xl border border-white/10 bg-[#0B1026] p-8 text-center shadow-2xl backdrop-blur-2xl sm:p-10">
          
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Authentication Required
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {error || "Please log in to your account to submit tickets or talk with support."}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => router.push("/login")}
              className="rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 active:scale-[0.98]"
            >
              Log In
            </button>
            <button
              onClick={() => router.push("/")}
              className="rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================
     3. GENERIC ERROR STATE
  ========================================= */
  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-400 backdrop-blur-xl">
          <AlertTriangle className="h-6 w-6 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  /* =========================================
     4. MAIN SUPPORT DASHBOARD
  ========================================= */
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* NAVIGATION BACK BUTTON */}
      <button
        onClick={() => router.push("/")}
        className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Dashboard
      </button>

      {/* HEADER SECTION */}
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400 mb-3">
            <ShieldCheck className="h-3.5 w-3.5" /> BC 360 Helpdesk
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Support Center
          </h1>
          <p className="mt-2 text-base text-slate-400">
            Select a service channel or connect with us directly using the options below.
          </p>
        </div>
      </div>

      {/* QUICK SELECTION CARDS GRID */}
      <div className="mb-12 grid gap-6 md:grid-cols-2">
        {/* Contact Support Direct Route */}
        <button
          onClick={() => router.push("/support/contact")}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0B1026] p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-[#101735] hover:shadow-2xl hover:shadow-blue-500/10"
        >
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20 transition-transform group-hover:scale-110">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-white">Contact Page</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Open a dedicated ticket page for detailed technical requests or custom system integrations.
            </p>
          </div>
          <div className="mt-8 flex items-center text-sm font-semibold text-blue-400 transition-colors group-hover:text-blue-300">
            Open Support Portal <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
          </div>
        </button>

        {/* Premium Live Chat Route */}
        <button
          onClick={() => router.push(isPremium ? "/support/chat" : "/subscription")}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0B1026] p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:bg-[#101735] hover:shadow-2xl hover:shadow-amber-500/10"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20 transition-transform group-hover:scale-110">
                <Headphones className="h-6 w-6" />
              </div>
              <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                <Sparkles className="h-3 w-3" /> PREMIUM
              </span>
            </div>
            <h2 className="mt-6 text-xl font-bold text-white">Live Support Chat</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Connect in real-time with our senior engineers for instant troubleshooting and guidance.
            </p>
          </div>
          <div className="mt-8 flex items-center text-sm font-semibold text-amber-400 transition-colors group-hover:text-amber-300">
            {isPremium ? "Start Live Session →" : "Upgrade to Unlock Chat →"}
          </div>
        </button>
      </div>

      {/* PREMIUM UPGRADE BANNER (Non-Premium Users) */}
      {!isPremium && (
        <div className="mb-12 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-400">Need Priority Response?</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">
                Subscribe to our Premium tier to skip standard ticketing queues and get direct access to real-time chat.
              </p>
            </div>
          </div>
        </div>
      )}

   {/* REDESIGNED CONTACT INFORMATION CONTAINER */}
      <div className="w-full">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0B1026] p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
          {/* Subtle Accent Radial Background */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Direct Contact Information
              </h2>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                Get in touch with the BC 360 team across official channels.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Email Card */}
            <a
              href="mailto:support@bc360.com"
              className="group relative flex items-start gap-4 rounded-2xl border border-white/5 bg-[#070D1E]/60 p-5 transition-all duration-300 hover:border-blue-500/40 hover:bg-[#070D1E] hover:shadow-lg hover:shadow-blue-500/5"
            >
              <div className="shrink-0 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-400 transition-transform group-hover:scale-110">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Email Support
                  </h3>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-1 truncate text-sm font-semibold text-white group-hover:text-blue-400">
                  dars7703@gmail.com
                </p>
                <p className="mt-0.5 text-xs text-slate-400">Response within 24 hours</p>
              </div>
            </a>

            {/* Phone Card */}
            <a
              href="tel:+1234567890"
              className="group relative flex items-start gap-4 rounded-2xl border border-white/5 bg-[#070D1E]/60 p-5 transition-all duration-300 hover:border-indigo-500/40 hover:bg-[#070D1E] hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <div className="shrink-0 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-indigo-400 transition-transform group-hover:scale-110">
                <Phone className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Phone Support
                  </h3>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-1 truncate text-sm font-semibold text-white group-hover:text-indigo-400">
                  +95 699 869 984
                </p>
                <p className="mt-0.5 text-xs text-slate-400">Mon–Fri, 9:00 AM - 6:00 PM</p>
              </div>
            </a>

            {/* Office Location Card */}
            <div className="group relative flex items-start gap-4 rounded-2xl border border-white/5 bg-[#070D1E]/60 p-5 transition-all duration-300 hover:border-purple-500/40 hover:bg-[#070D1E]">
              <div className="shrink-0 rounded-xl border border-purple-500/20 bg-purple-500/10 p-3 text-purple-400 transition-transform group-hover:scale-110">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Headquarters
                </h3>
                <p className="mt-1 text-sm font-semibold text-white">
                  BC 360 Global
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                  123 Digital Avenue, Mawlamyine, Mon
                </p>
              </div>
            </div>

            {/* Operating Hours Card */}
            <div className="group relative flex items-start gap-4 rounded-2xl border border-white/5 bg-[#070D1E]/60 p-5 transition-all duration-300 hover:border-amber-500/40 hover:bg-[#070D1E]">
              <div className="shrink-0 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-400 transition-transform group-hover:scale-110">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Business Hours
                </h3>
                <p className="mt-1 text-sm font-semibold text-white">
                  Mon – Fri: 9 AM – 6 PM
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Sat – Sun: Emergency Tickets Only
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}