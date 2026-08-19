import { notFound } from "next/navigation";
import SeriesDetailContent from "@/components/series/SeriesDetailContent";
import { apiUrl } from "@/lib/api-url";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getSeriesDetails(id: string) {
  const res = await fetch(
    apiUrl(`/api/user-portal/series/${id}`),
    {
      cache: "no-store",
    },
  );
  if (!res.ok) return null;
  return res.json();
}

async function getRelatedSeries(id: string) {
  const res = await fetch(
    apiUrl(`/api/user-portal/series/${id}/related`),
    {
      cache: "no-store",
    },
  );

  if (!res.ok) return [];

  const data = await res.json();

  return data.series;
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const { id } = await params;

  const seriesData = await getSeriesDetails(id);
  const relatedSeries = await getRelatedSeries(id);

  if (!seriesData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <SeriesDetailContent
          series={seriesData}
          relatedSeries={relatedSeries}
        />
      </div>
    </main>
  );
}
