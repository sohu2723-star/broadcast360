export default function VideoPlayer() {
  return (
    <div className="bg-[#0B1026] rounded-xl p-4 h-[420px] flex flex-col justify-between">

      {/* Video area */}
      <div className="flex-1 bg-black rounded-lg flex items-center justify-center text-gray-400">
        🎬 Live Video Player
      </div>

      {/* Info */}
      <div className="mt-3 flex items-center justify-between">

        <div>
          <h2 className="font-bold">CNN News</h2>
          <p className="text-sm text-gray-400">Breaking News Live</p>
        </div>

        <div className="flex items-center gap-2 text-red-500 font-bold">
          <span className="w-2.5 h-2.5 bg-[#1CFE10] rounded-full"></span>
          LIVE
        </div>

      </div>

    </div>
  );
}