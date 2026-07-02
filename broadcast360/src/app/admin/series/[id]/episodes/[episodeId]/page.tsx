"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Episode = {
  id: number;
  title: string;
  episodeNo: number;
  videoUrl: string;
  thumbnailUrl: string | null;
  createdAt: string;
};

type Series = {
  id: number;
  title: string;
  episodes: Episode[];
};

export default function EpisodePlayerPage() {
  const params = useParams();

  const seriesId = params?.id as string;
  const episodeId = params?.episodeId as string;

  const [series, setSeries] = useState<Series | null>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/series/${seriesId}`);

      if (!res.ok) {
        throw new Error("Failed to fetch series");
      }

      const data = await res.json();
      const foundSeries = data.data;

      setSeries(foundSeries);

      const foundEpisode = foundSeries.episodes.find(
        (ep: Episode) => ep.id === Number(episodeId)
      );

      setEpisode(foundEpisode || null);
    } catch (error) {
      console.error(error);
      setSeries(null);
      setEpisode(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!seriesId || !episodeId) return;
    loadData();
  }, [seriesId, episodeId]);

  if (loading) {
    return <div className="text-white p-6">Loading...</div>;
  }

  if (!series || !episode) {
    return <div className="text-white p-6">Episode not found</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white">

      {/* SIDEBAR */}
      <div className="w-80 bg-[#0B1026] border-r border-white/10 flex flex-col h-screen min-h-0">

        {/* Header (fixed) */}
        <div className="p-4 flex-shrink-0">
          <Link
            href={`/admin/series/${series.id}`}
            className="text-blue-400 text-sm"
          >
            ← Back to Series
          </Link>

          <h2 className="text-xl font-bold mt-4 mb-4">
            {series.title}
          </h2>
        </div>

        {/* Scrollable Episode List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0 custom-scrollbar">
          <div className="space-y-2">
            {series.episodes.map((ep) => (
              <Link
                key={ep.id}
                href={`/admin/series/${series.id}/episodes/${ep.id}`}
                className={`block p-3 rounded-lg ${ep.id === episode.id
                  ? "bg-blue-600"
                  : "bg-white/5 hover:bg-white/10"
                  }`}
              >
                <div className="font-semibold">
                  EP {ep.episodeNo}
                </div>

                <div className="text-sm text-gray-300">
                  {ep.title}
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">

        {/* TOP BAR */}
        <div className="h-16 border-b border-white/10 bg-[#0B1026] flex items-center justify-between px-6">
          <h1 className="font-bold">{series.title}</h1>

          <Link
            href={`/admin/series/${series.id}`}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            Back
          </Link>
        </div>

        {/* PLAYER */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">

            <video
              src={episode.videoUrl}
              controls
              autoPlay
              className="w-full rounded-xl bg-black"
              onLoadedMetadata={(e) => {
                const totalSeconds = Math.floor(e.currentTarget.duration);

                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;

                if (hours > 0) {
                  setDuration(`${hours}h ${minutes}m ${seconds}s`);
                } else if (minutes > 0) {
                  setDuration(`${minutes}m ${seconds}s`);
                } else {
                  setDuration(`${seconds}s`);
                }
              }}
            />

            <div className="mt-6">
              <p className="text-blue-400 text-sm">
                {series.title}
              </p>

              <h2 className="text-3xl font-bold mt-1">
                Episode {episode.episodeNo}: {episode.title}
              </h2>

              {/* Episode Details */}
              <div className="flex items-center gap-6 mt-4 text-gray-300">
                <span className="bg-white/5 px-3 py-1 rounded-full">
                  🎬 Ep {episode.episodeNo}
                </span>

                <span className="bg-white/5 px-3 py-1 rounded-full">
                  ⏱ {duration || "Loading..."}
                </span>

                <span className="bg-white/5 px-3 py-1 rounded-full">
                  📅 {new Date(episode.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Season Info */}
              <div className="mt-4 text-gray-300">
                Season 1 • Episode {episode.episodeNo} of {series.episodes.length}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                {series.episodes.findIndex((ep) => ep.id === episode.id) > 0 ? (
                  <Link
                    href={`/admin/series/${series.id}/episodes/${series.episodes[
                      series.episodes.findIndex((ep) => ep.id === episode.id) - 1
                    ].id
                      }`}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10"
                  >
                    ◀ Previous Episode
                  </Link>
                ) : (
                  <div />
                )}

                {series.episodes.findIndex((ep) => ep.id === episode.id) <
                  series.episodes.length - 1 ? (
                  <Link
                    href={`/admin/series/${series.id}/episodes/${series.episodes[
                      series.episodes.findIndex((ep) => ep.id === episode.id) + 1
                    ].id
                      }`}
                    className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500"
                  >
                    Next Episode ▶
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </div>


          </div>
        </div>

      </div>
    </div>
  );
}