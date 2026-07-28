"use client";

import type { Entertainment } from "@/types/entertainment";


interface Props {
  entertainments: Entertainment[];
  onSelect: (item: Entertainment) => void;
}


export default function PlaylistParts({
  entertainments,
  onSelect,
}: Props) {

  return (
    <div className="space-y-2">


      {entertainments.map((item) => (

        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className="w-full rounded-lg border border-white/10 bg-[#010312] p-3 text-left transition hover:border-[#106EE9]"
        >

          <p className="text-sm font-bold text-white">
            {item.title}
          </p>


          <p className="mt-1 text-xs text-gray-400">
            {item.description}
          </p>


        </button>

      ))}


    </div>
  );
}