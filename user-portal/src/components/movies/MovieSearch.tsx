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
    <div className="relative">
      <input
        type="search"

        value={value}

        onChange={(e) => onChange(e.target.value)}

        placeholder="Search movies by title..."

        className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-12 py-3 text-white outline-none focus:border-red-500"
      />
    </div>
  );
}
