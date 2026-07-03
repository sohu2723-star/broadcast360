import VideoPlayer from "./VideoPlayer";
import ChannelList from "./ChannelList";
import ChannelSearch from "./ChannelSearch";
import TrendingChannels from "./TrendingChannels";

export default function LiveTvLayout() {
  return (
    <div className="text-white space-y-6">

      {/* TOP SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* LEFT: VIDEO PLAYER */}
        <div className="lg:col-span-2">
          <VideoPlayer />
        </div>

        {/* RIGHT: CHANNEL PANEL */}
        <div className="bg-[#0B1026] rounded-xl p-4 flex flex-col gap-4 h-[420px]">

          {/* SEARCH */}
          <ChannelSearch />

          {/* CHANNEL LIST */}
          <div className="overflow-y-auto flex-1 space-y-2">
            <ChannelList />
          </div>

        </div>

      </div>

      {/* BOTTOM: TRENDING */}
      <div>
        <TrendingChannels />
      </div>

    </div>
  );
}