export default function NowPlayingCard() {
  return (
    <div className="rounded-xl border border-[#106EE9]/20 bg-[#0B1026] p-6">
      <h2 className="font-semibold">Now Playing</h2>

      <div className="mt-5">
        <h3 className="text-xl font-bold">Avatar Way Of Water</h3>

        <p className="mt-2 text-sm text-gray-400">Movie</p>
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-xs">
          <span>00:42:13</span>

          <span>02:13:00</span>
        </div>

        <div className="mt-2 h-2 rounded-full bg-gray-700">
          <div className="h-full w-[40%] rounded-full bg-blue-500" />
        </div>
      </div>
    </div>
  );
}
