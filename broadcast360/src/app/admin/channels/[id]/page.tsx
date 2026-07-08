"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

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
        const data = await res.json();
        setChannel(data);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      getChannel();
    }
  }, [id]);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!channel) {
    return <div className="text-red-500">Channel not found</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Channel Details</h1>

      <div className="bg-[#0B1026] rounded-2xl p-8 border border-white/10 max-w-3xl">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-[#106EE9] flex items-center justify-center">
            {channel.logo ? (
              <Image
                src={channel.logo}
                alt={channel.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl">📺</span>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold">{channel.name}</h2>
            <p className="text-gray-400">{channel.country}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-gray-400">Description</p>
            <p>{channel.description ?? "No description"}</p>
          </div>

          <div>
            <p className="text-gray-400">Channel ID</p>
            <p>{channel.id}</p>
          </div>

          <div>
            <p className="text-gray-400">Created</p>
            <p>{new Date(channel.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}