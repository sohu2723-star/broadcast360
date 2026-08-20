"use client";

type Session = {
  status: "STARTING" | "LIVE" | "SWITCHING" | "STOPPING" | "STOPPED" | "ERROR";
  startedAt: string | null;
  errorMessage: string | null;
  channel: {
    name: string;
  };
  schedule?: {
    playlist?: {
      name: string;
    };
  } | null;
};

interface Props {
  session: Session | null;
}

export default function SessionCard({ session }: Props) {
  if (!session) {
    return (
      <div className="h-full min-h-[160px] rounded-xl border border-[#4f6689]/20 bg-[#0F172A] p-6 shadow-md flex items-center justify-center">
        <p className="text-slate-400 text-sm">No broadcast session found</p>
      </div>
    );
  }

  const statusColor = {
    STARTING: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    LIVE: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    SWITCHING: "text-sky-400 bg-sky-400/10 border-sky-400/20",
    STOPPING: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    STOPPED: "text-slate-400 bg-slate-400/10 border-slate-400/20",
    ERROR: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  }[session.status];

  return (
    <div className="h-full rounded-xl border border-[#4f6689]/20 bg-[#0F172A] p-6 shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white">{session.channel.name}</h2>
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}>
            ● {session.status}
          </span>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Playlist:</span>
            <span className="font-medium text-slate-200">
              {session.schedule?.playlist?.name ?? "Main Feature Playlist"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Started:</span>
            <span className="font-mono text-xs text-slate-300">
              {session.startedAt
                ? new Date(session.startedAt).toLocaleString()
                : "-"}
            </span>
          </div>
        </div>
      </div>

      {session.errorMessage && (
        <div className="mt-4 rounded bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
          {session.errorMessage}
        </div>
      )}
    </div>
  );
}