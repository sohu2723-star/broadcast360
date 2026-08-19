"use client";

type HealthProps = {
  health?: {
    ffmpeg: string;
    mediaMTX: string;
    rtmp: string;
    hls: string;
    readersCount?: number;
  } | null;
};

export default function StreamHealthCard({ health }: HealthProps) {
  const items = [
    {
      name: "FFmpeg Core",
      status: health?.ffmpeg ?? "Stopped",
      isOk: health?.ffmpeg === "Running",
    },
    {
      name: "MediaMTX Edge",
      status: health?.mediaMTX ?? "Offline",
      isOk: health?.mediaMTX === "Healthy",
    },
    {
      name: "RTMP Ingress",
      status: health?.rtmp ?? "Disconnected",
      isOk: health?.rtmp === "Connected",
    },
    {
      name: "HLS Output",
      status: health?.hls ?? "Unavailable",
      isOk: health?.hls === "Available",
    },
  ];

  return (
    <div className="h-full rounded-xl border border-[#106EE9]/20 bg-[#0F172A] p-6 shadow-md">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3">
        Stream Health
      </h2>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.name} className="flex justify-between text-sm">
            <span className="text-slate-300">{item.name}</span>
            <span
              className={`font-semibold text-xs ${
                item.isOk ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              ● {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}