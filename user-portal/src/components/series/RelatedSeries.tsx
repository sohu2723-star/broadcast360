"use client";

import Image from "next/image";
import Link from "next/link";

interface RelatedSeriesItem {
  id: number;
  title: string;
  description?: string | null;
  genre?: string | null;
  thumbnail: string | null;
  latestEpisode?: {
    episodeNo: number;
    channel?: {
      name: string;
    };
  };
}

interface Props {
  series: RelatedSeriesItem[];
}

export default function RelatedSeries({ series }: Props) {
  if (!series.length) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold text-white">
        You may also like this
      </h2>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {series.map((item) => (
          <Link
            key={item.id}
            href={`/series/${item.id}`}
            className="group overflow-hidden rounded-2xl bg-zinc-900"
          >
            <div className="relative aspect-[2/3]">
              <Image
                src={item.thumbnail || "/images/no-image.png"}
                alt={item.title}
                fill
                unoptimized
                className="object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="line-clamp-2 text-xl font-bold text-white">
                  {item.title}
                </h3>

                <div className="mt-4">
                  <p className="text-sm font-semibold text-red-500">
                    {item.latestEpisode
                      ? `New Episode ${item.latestEpisode.episodeNo}`
                      : ""}
                  </p>

                  <p className="text-sm text-gray-300">
                    {item.latestEpisode?.channel?.name}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
