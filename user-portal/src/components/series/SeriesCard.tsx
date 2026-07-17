"use client";

import Image from "next/image";
import type { Series } from "@/types/series";
import Link from "next/link";

interface Props {
  series: Series;
}

export default function SeriesCard({ series }: Props) {
  return (
    <Link
      href={`/series/${series.id}`}
      className="
      group
      relative
      h-[380px]
      overflow-hidden
      rounded-xl
      bg-zinc-900
    "
    >
      {/* Full Image */}

      <Image
        src={series.thumbnail || "/images/no-image.png"}
        alt={series.title}
        fill
        className="
          object-cover
          transition
          duration-300
          group-hover:scale-110
        "
        unoptimized
      />

      {/* Dark overlay */}

      <div
        className="
        absolute
        inset-0
        bg-gradient-to-t
        from-black
        via-black/40
        to-transparent
      "
      />

      {/* Text bottom */}

      <div
        className="
        absolute
        bottom-0
        left-0
        right-0
        p-4
        text-white
      "
      >
        <h3
          className="
          line-clamp-1
          text-xl
          font-bold
        "
        >
          {series.title}
        </h3>

        <p
          className="
          mt-2
          line-clamp-2
          text-sm
          text-gray-300
        "
        >
          {series.description || "No description"}
        </p>

        <div
          className="
          mt-3
          text-sm
          text-red-400
        "
        >
          Episode {series.latestEpisode.episodeNo}
        </div>

        <div
          className="
          text-xs
          text-gray-300
        "
        >
          {series.channel.name}
        </div>
      </div>
    </Link>
  );
}
