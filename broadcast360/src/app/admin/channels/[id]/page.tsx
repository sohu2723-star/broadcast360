"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type Channel = {
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
  country: string | null;
  createdAt: string;
};

export default function ChannelDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getChannel() {
      try {
        const res = await fetch(`/api/channels/${id}`);

        if (!res.ok) {
          throw new Error("Failed to fetch channel");
        }

        const data = await res.json();
        setChannel(data);
      } catch (error) {
        console.error(error);
        setChannel(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      getChannel();
    }
  }, [id]);

  if (loading) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  if (!channel) {
     return (
      <div className="p-8 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-8 text-white">
      <Link
        href="/admin/channels"
        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#131B2E] px-4 py-2 text-sm transition hover:bg-[#1E293B]"
      >
        <ArrowLeft size={18} />
        Back
      </Link>

      <div className="max-w-4xl rounded-2xl border border-white/10 bg-[#0B1026]">
        {/* Top Section */}
        <div className="flex items-center gap-5 rounded-t-2xl p-6">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-[#151C35]">
            {channel.logo ? (
              <Image
                src={channel.logo}
                alt={channel.name}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl">📺</span>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold">{channel.name}</h1>

            <p className="mt-1 text-sm text-gray-400">
              {channel.country || "Unknown Country"}
            </p>
          </div>
        </div>

        {/* Detail Form */}
        <div className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-400">Channel ID</label>

              <div className="mt-2 rounded-xl bg-[#151C35] px-4 py-3">
                {channel.id}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400">Channel Name</label>

              <div className="mt-2 rounded-xl bg-[#151C35] px-4 py-3">
                {channel.name}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400">Country</label>

              <div className="mt-2 rounded-xl bg-[#151C35] px-4 py-3">
                {channel.country || "-"}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400">Created Date</label>

              <div className="mt-2 rounded-xl bg-[#151C35] px-4 py-3">
                {new Date(channel.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Description</label>

            <div className="mt-2 min-h-[120px] rounded-xl bg-[#151C35] px-4 py-4 leading-7 text-gray-300">
              {channel.description || "No description available."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
