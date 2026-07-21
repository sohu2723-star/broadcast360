"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { Episode } from "@/types/series-details";

interface Props {
  seriesId: number;
  episodes: Episode[];
  currentEpisode: Episode;
}

const EPISODES_PER_PAGE = 12;

export default function OtherEpisodes({
  seriesId,
  episodes,
  currentEpisode,
}: Props) {
  const router = useRouter();

  const [page, setPage] = useState(1);

  const sortedEpisodes = useMemo(
    () => [...episodes].sort((a, b) => b.episodeNo - a.episodeNo),
    [episodes],
  );

  const totalPages = Math.ceil(sortedEpisodes.length / EPISODES_PER_PAGE);

  const paginatedEpisodes = sortedEpisodes.slice(
    (page - 1) * EPISODES_PER_PAGE,
    page * EPISODES_PER_PAGE,
  );

  return (
    <section className="mt-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Episodes</h2>

        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setPage(index + 1)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                page === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
        {paginatedEpisodes.map((episode) => (
          <button
            key={episode.id}
            onClick={() =>
              router.push(`/series/${seriesId}/episode/${episode.id}`)
            }
            className={`group relative overflow-hidden rounded-2xl transition duration-300 ${
              currentEpisode.id === episode.id ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <div className="relative aspect-video">
              <Image
                src={episode.parts[0]?.thumbnail || "/images/no-image.png"}
                alt={episode.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-110"
                unoptimized
              />

              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              {/* Play Icon */}
              <div className="absolute right-3 top-3 rounded-full bg-black/60 p-2 opacity-0 transition group-hover:opacity-100">
                ▶
              </div>

              {/* Episode Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                <span className="inline-block rounded bg-blue-600 px-2 py-1 text-xs font-semibold">
                  EP.{episode.episodeNo}
                </span>

                <h3 className="mt-2 line-clamp-2 text-lg font-bold text-white">
                  {episode.title}
                </h3>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
