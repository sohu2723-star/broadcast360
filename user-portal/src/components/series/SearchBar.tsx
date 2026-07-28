"use client";

import { useEffect, useState } from "react";

interface Props {
  value: string;

  onChange: (value: string) => void;
}

export default function SearchBar({
  value,

  onChange,
}: Props) {
  const [text, setText] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(text);
    }, 500);

    return () => clearTimeout(timer);
  }, [text]);

  return (
    <input
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="Search series..."
      className="
        w-full
        rounded-lg
        border
        border-zinc-700
        bg-zinc-900
        px-4
        py-3
        text-white
        outline-none
        focus:border-blue-500
      "
    />
  );
}
