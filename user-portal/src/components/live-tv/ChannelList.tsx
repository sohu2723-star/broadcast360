const channels = [
  "CNN",
  "BBC",
  "FOX",
  "Al Jazeera",
  "Sky News",
];

export default function ChannelList() {
  return (
    <div className="space-y-2">

      {channels.map((ch) => (
        <div
          key={ch}
          className="p-2 rounded bg-[#010312] hover:bg-[#106EE9] cursor-pointer transition"
        >
          {ch}
        </div>
      ))}

    </div>
  );
}