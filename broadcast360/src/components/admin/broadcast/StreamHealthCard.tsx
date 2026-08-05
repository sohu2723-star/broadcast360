const items = [
  {
    name: "FFmpeg",
    status: "Running",
  },

  {
    name: "MediaMTX",
    status: "Healthy",
  },

  {
    name: "RTMP",
    status: "Connected",
  },

  {
    name: "HLS",
    status: "Available",
  },
];

export default function StreamHealthCard() {
  return (
    <div className="rounded-xl border border-[#106EE9]/20 bg-[#0B1026] p-5">
      <h2 className="font-semibold">Stream Health</h2>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.name} className="flex justify-between text-sm">
            <span>{item.name}</span>

            <span className="text-green-400">● {item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
