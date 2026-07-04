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

  useEffect(() => {
    const fetchAdDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/ads/${adId}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Advertisement data not found.");
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
      <div className="p-6 text-white space-y-8 max-w-5xl mx-auto animate-pulse">
        <div className="h-12 bg-white/5 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-video bg-white/5 rounded-2xl" />
          <div className="h-64 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="p-6 text-center text-slate-400 space-y-4 max-w-md mx-auto pt-20">
        <div className="text-sm bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
          {error || "Advertisement target identity missing."}
        </div>
        <button
          onClick={() => router.push("/admin/advertisements")} //
          className="text-xs font-semibold text-[#106EE9] hover:underline"
        >
          &larr; Back to Advertisements Registry
        </button>
      </div>
    );
  }

  return (
    <div className="">
      <div className="w-full flex items-center justify-start ">
        <button 
          onClick={() => router.push("/admin/ads")} //
          className=" transition-all flex items-center gap-2"
        >
          <span className="text-2xl transition-transform group-hover:-translate-x-1">&larr;</span>
          <span className="text-xl font-bold tracking-tight">Back</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start w-full">
        
        <div className="w-full mt-5">
          <div className="bg-[#070B1E] border border-white/10 rounded-2xl overflow-hidden shadow-2xl aspect-video w-full flex items-center justify-center relative">
            <video 
              src={ad.videoUrl} 
               width="500"
               height="250"
              controls
              className=" object-contain bg-black rounded-xl"
              preload="metadata"
            />
          </div>
          <p className="text-sm text-slate-500 mt-2 text-center italic">Preview Video</p>
        </div>

        {/* Right Section: Video Information & Action Buttons */}
        <div className="flex flex-col gap-6 w-full">
          
          {/* Metadata Card */}
          <div className="bg-[#070B1E] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-semibold tracking-wider text-[#106EE9] uppercase border-b border-white/5 pb-2">
              Details
            </h2>
            
            <div className="divide-y divide-white/5 text-sm">
              {/* Title Identity */}
              <div className="py-3 flex justify-between items-center gap-4">
                <span className="text-base text-slate-400 font-medium">Title:</span>
                <span className="text-slate-200 font-medium text-right truncate max-w-[250px]">{ad.title}</span>
              </div>

              {/* Playtime Duration */}
              <div className="py-3 flex justify-between items-center">
                <span className="text-base text-slate-400 font-medium">Duration:</span>
                <span className="text-slate-200 font-mono font-medium">{ad.duration} seconds</span>
              </div>

              {/* Status Banner Badge */}
              <div className="py-3 flex justify-between items-center">
                <span className="text-base text-slate-400 font-medium">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5  text-xs font-semibold ${
                  ad.active 
                    ? "bg-emerald-500/10 text-emerald-400 " 
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}>
                  <span className={`w-1.5 h-1.5  mr-1.5 ${ad.active ? "bg-emerald-400" : "bg-amber-400"}`} />
                  {ad.active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Video Target File Reference */}
              <div className="py-3 flex justify-between items-center gap-4">
                <span className="text-base text-slate-400 font-medium">File Context:</span>
                <span className="text-slate-300 font-mono text-xs truncate max-w-[220px] bg-white/5 px-2 py-1 rounded">
                  {ad.videoUrl.split("/").pop() || ad.videoUrl}
                </span>
              </div>

              {/* Created Date */}
              <div className="py-3 flex justify-between items-center">
                <span className="text-base text-slate-400 font-medium">Created Date:</span>
                <span className="text-slate-300 font-mono text-xs">{ad.createdAt}</span>
              </div>
            </div>
          </div>

          {/* Solid Color Bright Action Buttons */}
          <div className="flex items-center justify-end gap-4 w-full pt-2">
            <button
              onClick={() => router.push(`/admin/ads/edit/${ad.id}`)} 
              style={{ backgroundColor: "#2b10f4" ,width:"200px"}}
              className="px-6 py-2.5 rounded-xl bg-[#106EE9] hover:bg-[#106EE9]/90 text-white font-bold text-base transition-all shadow-lg active:scale-[0.98]"
            >
              Edit
            </button>
            <button
              // onClick={() => handleDelete(ad.id)}
             style={{ backgroundColor: "#F41010" ,width:"200px"}} 
             className="text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
            >
              {isPending ? "Deleting..." : "Delete"}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
