"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import SearchBar from "./SearchBar";
import Pagination from "./pagination";
import SeriesGrid from "./SeriesGrid";
import type { Series } from "@/types/series";

interface Props {
  series: Series[];
  page: number;
  totalPages: number;
  search: string;
}

export default function SeriesContent({
  series,
  page,
  totalPages,
  search,
}: Props) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const hotSeries = series.slice(0, 5);

  function updateQuery(key: string, value: string) {
    const scrollY = window.scrollY;

    const params = new URLSearchParams();

    if (key !== "search" && search) {
      params.set("search", search);
    }

    if (value) {
      params.set(key, value);
    }

    startTransition(() => {
      router.push(`/series?${params.toString()}`, {
        scroll: false,
      });
    });

    setTimeout(() => {
      window.scrollTo(0, scrollY);
    }, 100);
  }

  return (
    <>
      <div className="mb-8 flex gap-4">
        <SearchBar
          value={search}
          onChange={(value) => updateQuery("search", value)}
        />
        {isPending && <div className="text-sm text-gray-400">Loading...</div>}
      </div>
      <SeriesGrid title=" Hot Series" series={hotSeries} horizontal />

      <SeriesGrid title="All Series" series={series} />

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(p) => updateQuery("page", String(p))}
      />
    </>
  );
}
