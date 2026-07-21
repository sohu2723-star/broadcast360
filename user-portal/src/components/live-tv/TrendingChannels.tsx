const trending = ["CNN", "BBC", "FOX", "Sky", "Al Jazeera", "DW News"];

export default function TrendingChannels() {
  return (
    <div className="bg-[#0B1026] rounded-xl p-4">
      <h2 className="font-bold mb-3">🔥 Trending Channels</h2>

      <div className="flex gap-3 overflow-x-auto">
        {trending.map((t) => (
          <div
            key={t}
            className="min-w-[120px] bg-[#010312] p-3 rounded text-center hover:bg-[#106EE9] cursor-pointer"
          >
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}
