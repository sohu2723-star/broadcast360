"use client";

import Link from "next/link";

import Image from "next/image";

interface RelatedSeriesItem {
  id: number;

  title: string;

  thumbnail: string | null;

  genre: string | null;
}

interface Props {
  series: RelatedSeriesItem[];
}

export default function RelatedSeries({ series }: Props) {
  if (series.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold text-white">Related Series</h2>

      <div
        className="
        flex
        gap-5
        overflow-x-auto
        scrollbar-hide
      "
      >
        {series.map((item) => (
          <Link
            key={item.id}
            href={`/series/${item.id}`}
            className="
              group
              min-w-[220px]
            "
          >
            <div
              className="
              relative
              h-[320px]
              overflow-hidden
              rounded-xl
            "
            >
              <Image
                src={item.thumbnail || "/images/no-image.png"}
                alt={item.title}
                fill
                className="
                  object-cover
                  transition
                  duration-300
                  group-hover:scale-105
                "
                unoptimized
              />
            </div>

            <h3
              className="
              mt-3
              text-lg
              font-semibold
              text-white
            "
            >
              {item.title}
            </h3>

            <p
              className="
              text-sm
              text-gray-400
            "
            >
              {item.genre}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
