"use client";

import { useEffect, useState } from "react";

type DashboardData = {
  stats: {
    totalChannels: number;
    liveStreams: number;
    movies: number;
    users: number;
  };

  channels: {
    name: string;
    status: string;
  }[];

  activities: {
    message: string;
    time: string;
  }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return <div className="text-white">Loading Dashboard...</div>;
  }

  const stats = [
    {
      title: "Total Channels",
      value: data.stats.totalChannels,
      icon: "📺",
    },

    {
      title: "Live Streams",
      value: data.stats.liveStreams,
      icon: "🔴",
    },

    {
      title: "Movies",
      value: data.stats.movies,
      icon: "🎬",
    },

    {
      title: "Users",
      value: data.stats.users,
      icon: "👥",
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-4 gap-6">
        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/10 bg-[#0B1026] p-6"
          >
            <div className="text-3xl">{item.icon}</div>

            <p className="mt-4 text-gray-400">{item.title}</p>

            <h2 className="text-4xl font-bold">{item.value}</h2>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-[#0B1026] p-6">
        <h2 className="text-xl font-bold">Live Status</h2>

        <div className="mt-5 space-y-4">
          {data.channels.map((channel) => (
            <div key={channel.name} className="flex justify-between">
              <span>{channel.name}</span>

              <span
                className={
                  channel.status === "LIVE" ? "text-green-400" : "text-red-400"
                }
              >
                ● {channel.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
