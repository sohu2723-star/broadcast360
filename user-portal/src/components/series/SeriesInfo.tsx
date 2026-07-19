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

        <div className="flex flex-col ">
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
            {series.description
              ? series.description.length > 200
                ? `${series.description.slice(0, 200)}...`
                : series.description
              : "No description available."}
          </p>
        </div>
      </div>
    </section>
  );
}
