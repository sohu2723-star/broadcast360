import Image from "next/image";
import type { SeriesDetail } from "@/types/series-details";

interface Props {
  series: SeriesDetail;
}

export default function SeriesInfo({ series }: Props) {
  return (
    <section className="mb-10">
      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        {/* Thumbnail */}

        <div className="relative h-[400px] overflow-hidden rounded-xl">
          <Image
            src={series.thumbnail || "/images/no-image.png"}
            alt={series.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Information */}

        <div className="flex flex-col justify-center">
          <h1 className="mb-4 text-4xl font-bold text-white">{series.title}</h1>

          <div className="mb-6 flex flex-wrap gap-3">
            {series.genre && (
              <span className="rounded bg-red-600 px-3 py-1 text-sm text-white">
                {series.genre}
              </span>
            )}

            {series.releaseYear && (
              <span className="rounded bg-zinc-800 px-3 py-1 text-sm text-white">
                {series.releaseYear}
              </span>
            )}

            {series.latestEpisode?.channel && (
              <span className="rounded bg-blue-600 px-3 py-1 text-sm text-white">
                {series.latestEpisode.channel.name}
              </span>
            )}
          </div>

          <p className="leading-8 text-gray-300">
            {series.description || "No description available."}
          </p>

          <div className="mt-8 rounded-lg bg-zinc-900 p-4">
            <p className="text-gray-400">Latest Episode</p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Episode {series.latestEpisode.episodeNo}
            </h2>

            <p className="mt-2 text-gray-300">{series.latestEpisode.title}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
