"use client";

import { useState, useEffect, useTransition, use } from "react";
import { useRouter } from "next/navigation";

interface Advertisement {
  id: number;
  title: string;
  videoUrl: string;
  duration: number;
  active: boolean;
  createdAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdvertisementDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const adId = resolvedParams.id;

  const [ad, setAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [hrs, mins, secs].map((v) => String(v).padStart(2, "0")).join(":");
  };

  useEffect(() => {
    const fetchAdDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/ads/${adId}`);
        if (!res.ok) {
          if (res.status === 404)
            throw new Error("Advertisement data not found.");
          throw new Error("Failed to communicate with database.");
        }
        const result = await res.json();
        setAd(result.data);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdDetails();
  }, [adId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl animate-pulse space-y-8 p-6 text-white">
        <div className="h-12 w-1/3 rounded-xl bg-white/5" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="aspect-video rounded-2xl bg-white/5" />
          <div className="h-64 rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-6 pt-20 text-center text-slate-400">
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error || "Advertisement target identity missing."}
        </div>
        <button
          onClick={() => router.push("/admin/advertisements")}
          className="text-xs font-semibold text-[#4f6689] hover:underline"
        >
          &larr; Back to Advertisements Registry
        </button>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex w-full items-center justify-start">
        <button
          onClick={() => router.push("/admin/ads")}
          className="cursor-pointer rounded-xl bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20"
        >
          ← Back
        </button>
      </div>
      <div className="grid w-full grid-cols-1 items-start gap-8 md:grid-cols-2">
        <div className="mt-5 w-full">
          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#070B1E] shadow-2xl">
            <video
              src={ad.videoUrl}
              width="500"
              height="250"
              controls
              className="rounded-xl bg-black object-contain"
              preload="metadata"
            />
          </div>
          <p className="mt-2 text-center text-sm text-slate-500 italic">
            Preview Video
          </p>
        </div>

        {/* Right Section: Video Information & Action Buttons */}
        <div className="flex w-full flex-col gap-6">
          {/* Metadata Card */}
          <div className="space-y-4 rounded-2xl border border-white/10 bg-[#070B1E] p-6 shadow-2xl">
            <h2 className="border-b border-white/5 pb-2 text-xl font-semibold tracking-wider text-[#4f6689] uppercase">
              Details
            </h2>

            <div className="divide-y divide-white/5 text-sm">
              {/* Title Identity */}
              <div className="flex items-center justify-between gap-4 py-3">
                <span className="text-base font-medium text-slate-400">
                  Title:
                </span>
                <span className="max-w-[250px] truncate text-right font-medium text-slate-200">
                  {ad.title}
                </span>
              </div>

              {/* Playtime Duration */}
              <div className="flex items-center justify-between py-3">
                <span className="text-base font-medium text-slate-400">
                  Duration:
                </span>
                <span className="font-mono font-medium text-slate-200">
                  {formatDuration(ad.duration)}
                </span>
              </div>

              {/* Status Banner Badge */}
              <div className="flex items-center justify-between py-3">
                <span className="text-base font-medium text-slate-400">
                  Status:
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold ${
                    ad.active
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                  }`}
                >
                  <span
                    className={`mr-1.5 h-1.5 w-1.5 ${ad.active ? "bg-emerald-400" : "bg-amber-400"}`}
                  />
                  {ad.active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Video Target File Reference */}
              <div className="flex items-center justify-between gap-4 py-3">
                <span className="text-base font-medium text-slate-400">
                  File Context:
                </span>
                <span className="max-w-[220px] truncate rounded bg-white/5 px-2 py-1 font-mono text-xs text-slate-300">
                  {ad.videoUrl.split("/").pop() || ad.videoUrl}
                </span>
              </div>

              {/* Created Date */}
              <div className="flex items-center justify-between py-3">
                <span className="text-base font-medium text-slate-400">
                  Created Date:
                </span>
                <span className="font-mono text-xs text-slate-300">
                  {formatDate(ad.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Solid Color Bright Action Buttons */}
          <div className="flex w-full items-center justify-end gap-4 pt-2">
            <button
              onClick={() => router.push(`/admin/ads/edit/${ad.id}`)}
              style={{ backgroundColor: "#2b10f4", width: "200px" }}
              className="rounded-xl bg-[#4f6689] px-6 py-2.5 text-base font-bold text-white shadow-lg transition-all hover:bg-[#4f6689]/90 active:scale-[0.98]"
            >
              Edit
            </button>
            <button
              // onClick={() => handleDelete(ad.id)}
              style={{ backgroundColor: "#F41010", width: "200px" }}
              className="rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
            >
              {isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
