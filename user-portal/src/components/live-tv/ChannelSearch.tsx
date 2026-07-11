"use client";

interface ChannelSearchProps {
  query: string;
  setQuery: (val: string) => void;
}

export default function ChannelSearch({ query, setQuery }: ChannelSearchProps) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search channel..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-[#121824] text-gray-200 pl-4 pr-10 py-3 rounded-lg border border-gray-800 focus:outline-none focus:border-blue-500 transition-all text-sm placeholder-gray-500"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
        >
          ✕
        </button>
      )}
    </div>
  );
}