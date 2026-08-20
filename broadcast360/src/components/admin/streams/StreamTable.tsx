"use client";

import Link from "next/link";

export type Stream = {
  id: number;
  name: string;
  url: string;
  protocol: string;
  status: string;
  channel: {
    name: string;
  };
};

interface Props {
  streams: Stream[];

  loading: boolean;

  onDelete: (id: number) => void;
}

export default function StreamTable({ streams, loading, onDelete }: Props) {
  if (loading) {
    return <div className="text-gray-400">Loading streams...</div>;
  }

  if (streams.length === 0) {
    return (
      <div
        className="
bg-[#0B1026]
p-6
rounded-xl
text-gray-400
"
      >
        No streams found
      </div>
    );
  }

  return (
    <div
      className="
bg-[#0B1026]
rounded-xl
border
border-gray-800
overflow-hidden
"
    >
      <table
        className="
w-full
text-left
"
      >
        <thead
          className="
bg-[#010312]
text-gray-400
"
        >
          <tr>
            <th className="p-4">Name</th>

            <th className="p-4">Channel</th>

            <th className="p-4">Protocol</th>

            <th className="p-4">Status</th>

            <th className="p-4">Action</th>
          </tr>
        </thead>

        <tbody>
          {streams.map((stream) => (
            <tr
              key={stream.id}
              className="
border-t
border-gray-800
"
            >
              <td className="p-4">{stream.name}</td>

              <td className="p-4">{stream.channel?.name}</td>

              <td className="p-4">{stream.protocol}</td>

              <td className="p-4">
                <span
                  className={`
px-3
py-1
rounded-full
text-sm

${
  stream.status === "ONLINE"
    ? "bg-green-500/20 text-green-400"
    : "bg-gray-700 text-gray-300"
}

`}
                >
                  {stream.status}
                </span>
              </td>

              <td className="p-4 flex gap-3">
                <Link
                  href={`/admin/streams/${stream.id}/edit`}
                  className="
bg-[#4f6689]
px-4
py-2
rounded-lg
hover:opacity-80
"
                >
                  Edit
                </Link>

                <button
                  onClick={() => onDelete(stream.id)}
                  className="
bg-red-600
px-4
py-2
rounded-lg
hover:opacity-80
"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
