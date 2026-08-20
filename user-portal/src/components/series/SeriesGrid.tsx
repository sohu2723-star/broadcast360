"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Series } from "@/types/series";
import SeriesCard from "./SeriesCard";

interface Props {
  title?: string;
  series: Series[];
  horizontal?: boolean;
}

export default function SeriesGrid({
  title,
  series,
  horizontal = false,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollLeft() {
    scrollRef.current?.scrollBy({
      left: -350,
      behavior: "smooth",
    });
  }

  function scrollRight() {
    scrollRef.current?.scrollBy({
      left: 350,
      behavior: "smooth",
    });
  }

  if (!series || series.length === 0) {
    return (
      <section className="mb-10">
        {title && (
          <h2 className="mb-5 text-2xl font-bold text-white">{title}</h2>
        )}

        <p className="text-gray-400">No series found.</p>
      </section>
    );
  }

  return (
    <section className="mb-10">
      {title && <h2 className="mb-5 text-2xl font-bold text-white">{title}</h2>}

      {horizontal ? (
        <div className="relative">
          <button
            type="button"
            aria-label="Scroll series left"
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white transition hover:bg-black"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scroll-smooth hide-scrollbar"
          >
            {series.map((item) => (
              <div key={item.id} className="min-w-[250px] flex-shrink-0">
                <SeriesCard series={item} />
              </div>
            ))}
          </div>

          <button
            type="button"
            aria-label="Scroll series right"
            onClick={scrollRight}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white transition hover:bg-black"
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {series.map((item) => (
            <SeriesCard key={item.id} series={item} />
          ))}
        </div>
      )}
    </section>
  );
}
