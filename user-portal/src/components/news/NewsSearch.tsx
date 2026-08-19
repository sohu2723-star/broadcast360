"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function NewsSearch({
  value,
  onChange,
}: Props) {
  return (
    <div className="relative w-full">
      <input
        type="search"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder="Search news by title..."
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-12 py-3 text-white outline-none focus:border-[#106EE9]"
      />

      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
        🔎
      </span>
    </div>
  );
}