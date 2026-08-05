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
      <div className="rounded-xl border border-[#106EE9]/20 bg-[#0B1026] p-6">
        <p className="text-gray-400">No broadcast session</p>
      </div>
    );
  }

  const statusColor = {
    STARTING: "text-yellow-400",

    LIVE: "text-green-400",

    SWITCHING: "text-blue-400",

    STOPPING: "text-orange-400",

    STOPPED: "text-gray-400",

    ERROR: "text-red-400",
  }[session.status];

  return (
    <div className="rounded-xl border border-[#106EE9]/20 bg-[#0B1026] p-6">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">{session.channel.name}</h2>

        <span className={`font-semibold ${statusColor} `}>
          ● {session.status}
        </span>
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <div>
          <span className="text-gray-400">Playlist:</span>

          <span className="ml-2">
            {session.schedule?.playlist?.name ?? "Fallback Playlist"}
          </span>
        </div>

        <div>
          <span className="text-gray-400">Started:</span>

          <span className="ml-2">
            {session.startedAt
              ? new Date(session.startedAt).toLocaleString()
              : "-"}
          </span>
        </div>

        {session.errorMessage && (
          <div className="rounded bg-red-500/10 p-3 text-red-400">
            {session.errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
