"use client";

interface Props {
  value: string;

  onChange: (value: string) => void;
}

export default function MovieSearch({
  value,

  onChange,
}: Props) {
  return (
    <div className="relative w-full">
      <input
        type="search"

        value={value}

        onChange={(e) => onChange(e.target.value)}

        placeholder="Search movies by title..."

       className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-12 py-3 text-white outline-none focus:border-[#106EE9]"
      />
    </div>
  );
}
